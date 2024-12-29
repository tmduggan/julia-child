import { useState } from 'react'
import { format, subDays } from 'date-fns'
import WeekView from './components/WeekView'
import DayInput from './components/DayInput'
import DailyGoals from './components/DailyGoals'

function App() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Calorie Tracker</h1>
      
      <div className="space-y-8">
        <DailyGoals />
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Previous Week</h2>
          <WeekView 
            startDate={format(subDays(new Date(), 6), 'yyyy-MM-dd')}
            endDate={format(new Date(), 'yyyy-MM-dd')}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Food Log for {format(new Date(selectedDate), 'MMMM d, yyyy')}
          </h2>
          <DayInput date={selectedDate} />
        </div>
      </div>
    </div>
  )
}

export default App
