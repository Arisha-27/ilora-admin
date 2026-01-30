import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface SheetData {
  [key: string]: any[]
}

export interface GoogleSheetsDBHook {
  data: any[]
  allData: SheetData
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addRow: (rowData: any, sheet?: string) => Promise<boolean>
  updateRow: (rowIndex: number, rowData: any, sheet?: string) => Promise<boolean>
  deleteRow: (rowIndex: number, sheet?: string) => Promise<boolean>
}

export function useGoogleSheetsDB(sheetName?: string): GoogleSheetsDBHook {
  const [data, setData] = useState<any[]>([])
  const [allData, setAllData] = useState<SheetData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: result, error: functionError } = await supabase.functions.invoke('fetch-sheets-data',
        sheetName ? { body: { sheet: sheetName } } : {}
      )

      if (functionError) throw functionError

      if (sheetName) {
        setData(result?.data || [])
      } else {
        setAllData(result || {})
      }
    } catch (err) {
      console.error('Error fetching Google Sheets data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [sheetName])

  const performCRUDOperation = useCallback(async (action: string, payload: any, overrideSheet?: string): Promise<boolean> => {
    try {
      // 1. Determine the target sheet
      // Priority: Explicit Override > Hook Initialization > Inside rowData
      let targetSheet = overrideSheet || sheetName;

      if (!targetSheet && payload.rowData && payload.rowData.sheet) {
        targetSheet = payload.rowData.sheet;
      }

      if (!targetSheet) {
        throw new Error(`Target sheet not specified for ${action}. Initialize the hook with a sheet name or pass it in the function.`);
      }

      const { data: result, error: functionError } = await supabase.functions.invoke('sheets-crud', {
        method: 'POST',
        body: {
          action,
          sheet: targetSheet, // Now guaranteed to be set
          ...payload
        }
      })

      if (functionError) throw functionError
      if (result.error) throw new Error(result.error)

      await fetchData()
      return true
    } catch (err) {
      console.error(`Error performing ${action}:`, err)
      toast.error(`Failed to ${action}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return false
    }
  }, [sheetName, fetchData])

  // UPDATED: Now accepts optional 'sheet' argument
  const addRow = useCallback(async (rowData: any, sheet?: string): Promise<boolean> => {
    return performCRUDOperation('addRow', { rowData }, sheet)
  }, [performCRUDOperation])

  const updateRow = useCallback(async (rowIndex: number, rowData: any, sheet?: string): Promise<boolean> => {
    return performCRUDOperation('updateRow', { rowIndex, rowData }, sheet)
  }, [performCRUDOperation])

  const deleteRow = useCallback(async (rowIndex: number, sheet?: string): Promise<boolean> => {
    return performCRUDOperation('deleteRow', { rowIndex }, sheet)
  }, [performCRUDOperation])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data: sheetName ? data : [],
    allData: sheetName ? {} : allData,
    loading,
    error,
    refetch: fetchData,
    addRow,
    updateRow,
    deleteRow
  }
}