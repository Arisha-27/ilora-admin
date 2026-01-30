import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface SheetData {
  [key: string]: any[]
}

export function useGoogleSheets(sheetName?: string) {
  const [data, setData] = useState<any[]>([])
  const [allData, setAllData] = useState<SheetData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = sheetName 
        ? `https://xpgmeejnbjlrctwgsxkk.supabase.co/functions/v1/fetch-sheets-data?sheet=${sheetName}`
        : `https://xpgmeejnbjlrctwgsxkk.supabase.co/functions/v1/fetch-sheets-data`
      
      const { data: result, error: functionError } = await supabase.functions.invoke('fetch-sheets-data', {
        method: 'GET'
      })
      
      if (functionError) {
        throw functionError
      }
      
      if (sheetName) {
        setData(result?.data || [])
      } else {
        setAllData(result || {})
      }
    } catch (err) {
      console.error('Error fetching Google Sheets data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      
      // Fallback to mock data if sheets fail
      if (sheetName) {
        setData(getMockData(sheetName))
      } else {
        setAllData(getAllMockData())
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [sheetName])

  return {
    data: sheetName ? data : allData,
    loading,
    error,
    refetch: fetchData
  }
}

// Mock data fallbacks
function getMockData(sheetName: string): any[] {
  const mockData = getAllMockData()
  return mockData[sheetName] || []
}

function getAllMockData(): SheetData {
  return {
    Analytics_Dashboard: [
      {
        Date: '2024-01-15',
        'Total Interactions': '450',
        'Unique Sessions': '320',
        'Intents Triggered': '890',
        'Channel Distribution': 'WhatsApp: 60%, App: 30%, Web: 10%',
        Interaction_Volume: 'High',
        'Guest Needs Breakdown': 'Food: 40%, Room: 35%, Service: 15%, Other: 10%',
        Avg_Resolution_Time: '12.5',
        Guest_Satisfaction_pct: '94.2'
      }
    ],
    ticket_management: [
      {
        'Ticket ID': 'TK001',
        'Guest Name': 'John Smith',
        'Room No': '205',
        'Request/Query': 'Air conditioning not working',
        Category: 'Tech',
        'Assigned To': 'Mike Johnson',
        Status: 'In Progress',
        'Created At': '2024-01-15T10:30:00Z',
        'Resolved At': '',
        Notes: 'Technician dispatched'
      }
    ],
    review_managment: [
      {
        'Review ID': 'REV001',
        Platform: 'Google',
        'Guest Name': 'Sarah Wilson',
        'Review Text': 'Excellent service and beautiful rooms!',
        Rating: '5',
        Sentiment: 'Positive',
        'Assigned Ticket': '',
        Status: 'Open',
        Date: '2024-01-15'
      }
    ],
    user_information: [
      {
        'User ID': 'USR001',
        Name: 'Alice Cooper',
        Role: 'Front Desk',
        Email: 'alice@grandbudapest.com',
        Phone: '+1234567890',
        'Last Login': '2024-01-15T08:00:00Z',
        Status: 'Active',
        'Tasks Assigned': '5'
      }
    ],
    Booking_Info: [
      {
        'Booking ID': 'BK001',
        'Guest Name': 'Robert Brown',
        'Room No': '301',
        'Check-In': '2024-01-16',
        'Check-Out': '2024-01-20',
        'Guest Type': 'Business',
        Channel: 'Direct',
        Notes: 'Early check-in requested'
      }
    ]
  }
}