import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfh2HvU5E0Y0Ruv5Ylfwdh524c0PWLCU0NduferN4etm08ovIMO6WoFoJVszmQx__O/exec'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { searchParams } = new URL(req.url)
    let sheetName = searchParams.get('sheet')
    
    // Also support POST with JSON body (when invoked via supabase.functions.invoke)
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        if (body && typeof body.sheet === 'string') {
          sheetName = body.sheet
        }
      } catch (_) {
        // Ignore if no JSON body is provided
      }
    }
    
    if (APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      // Return mock data if Apps Script URL is not configured
      console.log('Apps Script URL not configured, returning mock data')
      return new Response(JSON.stringify(getMockData(sheetName)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Build the Apps Script URL with parameters
    const appsScriptUrl = new URL(APPS_SCRIPT_URL)
    if (sheetName) {
      appsScriptUrl.searchParams.set('action', 'getSheetData')
      appsScriptUrl.searchParams.set('sheet', sheetName)
    } else {
      appsScriptUrl.searchParams.set('action', 'getAllData')
    }
    
    console.log(`Calling Apps Script: ${appsScriptUrl.toString()}`)
    
    // Call Google Apps Script
    const response = await fetch(appsScriptUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`Apps Script request failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }
    
    // Return the data in the expected format
    if (sheetName) {
      return new Response(JSON.stringify({ data: data, sheet: sheetName }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
  } catch (error) {
    console.error('Error in fetch-sheets-data function:', error)
    
    // Fallback to mock data on error
    const { searchParams } = new URL(req.url)
    const sheetName = searchParams.get('sheet')
    
    return new Response(JSON.stringify(getMockData(sheetName)), {
      status: 200, // Return 200 with mock data instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// Mock data fallback (simplified version of your current mock data)
function getMockData(sheetName?: string | null) {
  const allMockData = {
    ticket_management: [
      {
        'Ticket ID': 'TCK-001',
        'Guest Name': 'Rajiv Mehta',
        'Room No': '101',
        'Request': 'Bring coffee',
        'Category': 'Food & Beverage',
        'Assigned To': 'Food Staff 01',
        'Status': 'Resolved',
        'Created At': '2025-09-12 09:15',
        'Resolved At': '2025-09-12 09:25',
        'Notes': 'Delivered successfully'
      }
    ],
    review_management: [
      {
        'Review ID': 'RVW-001',
        'Platform': 'Google',
        'Guest Name': 'Neha Patel',
        'Review Text': 'Loved the stay, staff was amazing!',
        'Rating': '5',
        'Sentiment': 'Positive',
        'Assigned Ticket': '',
        'Status': 'Closed',
        'Date': '2025-09-11'
      }
    ],
    user_information: [
      {
        'User ID': 'U-001',
        'Name': 'Riya Sharma',
        'Role': 'Front Desk',
        'Email': 'riya.sharma@grandbudapest.com',
        'Phone': '9876543210',
        'Last Login': '2025-09-12 10:20',
        'Status': 'Active',
        'Tasks Assigned': '12'
      }
    ],
    Booking_Info: [
      {
        'Booking ID': 'BKG-101',
        'Guest Name': 'Rajiv Mehta',
        'Room No': '101',
        'Check-In': '2025-09-10',
        'Check-Out': '2025-09-14',
        'Guest Type': 'Business',
        'Channel': 'Website',
        'Notes': 'Requested airport transfer'
      }
    ],
    Analytics_Dashboard: [
      {
        'Date': '2025-09-10',
        'Total Interactions': '250',
        'Unique Sessions': '180',
        'Intents Triggered': '75',
        'Channel Distribution (WhatsApp/App/Web)': '120/80/50',
        'Interaction Volume': 'High',
        'Guest Needs Breakdown (Food/Room/Service/Other)': '90/80/60/20',
        'Avg Resolution Time': '15 mins',
        'Guest Satisfaction %': '92%'
      }
    ],
    QnA_Manager: [
      {
        'QnA ID': 'QA-001',
        'Question': 'What time is breakfast served?',
        'Answer': 'Breakfast is served between 7:00 AM – 10:30 AM.',
        'Usage Count': '120',
        'Last Updated': '2025-09-12',
        'Status': 'Active'
      }
    ],
    Campaigns_Manager: [
      {
        'Campaign ID': 'CMP-001',
        'Name': 'Weekend Buffet Offer',
        'Type': 'Promotion',
        'Channel': 'WhatsApp',  
        'Target Audience': 'Families',
        'Start Date': '2025-09-10',
        'End Date': '2025-09-12',
        'Status': 'Completed',
        'Engagement %': '65%',
        'Notes': 'Increased F&B revenue'
      }
    ],
    'Dos and Donts': [
      {
        'Rule ID': 'P-001',
        'Category': 'Guest Rules',
        'Type': 'Do',
        'Description': 'Always greet guests with a smile.',
        'Visible To': 'All Staff'
      }
    ],
    agents: [
      {
        'Agent ID': 'A-001',
        'Name': 'Riya Sharma',
        'Role': 'Front Desk',
        'Email': 'riya.sharma@grandbudapest.com',
        'Phone': '9876543210',
        'Joined Date': '2025-08-01',
        'Status': 'Active',
        'Performance Score': '95%',
        'Tickets Closed': '35',
        'Avg Response Time': '12 mins'
      }
    ],
    guest_interaction_log: [
      {
        'Log ID': 'LOG-001',
        'Timestamp': '2025-09-13 01:19:20',
        'Source': 'Web',
        'Session ID': 'SID-001',
        'Guest Email': 'guest1@example.com',
        'Guest Name': 'Guest 1',
        'User Input': 'Please clean my room',
        'Bot Response': 'Sure, we have logged your request for room cleaning.',
        'Intent': 'Room Cleaning',
        'Guest Type': 'Guest',
        'Sentiment': 'Neutral',
        'Reference Ticket ID': 'TKT-1001',
        'Conversation URL': ''
      }
    ]
  }
  
  if (sheetName) {
    return { data: allMockData[sheetName as keyof typeof allMockData] || [], sheet: sheetName }
  } else {
    return allMockData
  }
}