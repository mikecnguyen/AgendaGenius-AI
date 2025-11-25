import React from 'react';
import { Clock, Users, Calendar, ArrowRight } from 'lucide-react';
import { Agenda } from '../types';

interface AgendaTimelineProps {
  agenda: Agenda | null;
}

const AgendaTimeline: React.FC<AgendaTimelineProps> = ({ agenda }) => {
  if (!agenda) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-12 text-center">
        <Calendar className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-zinc-500">No Agenda Generated Yet</h3>
        <p className="max-w-md mt-2 text-sm text-zinc-400">Upload documents on the left and click "Generate Agenda" to create a structured timeline for your meeting.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mb-3">
                <Calendar className="w-3 h-3" />
                Meeting Agenda
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{agenda.meetingTitle}</h1>
              <p className="text-zinc-500 mt-2 text-lg">{agenda.meetingGoal}</p>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              <div className="flex items-center gap-3 text-sm text-zinc-600 bg-zinc-50 px-4 py-3 rounded-xl border border-zinc-100">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="font-semibold">{agenda.totalDuration}</span>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <Users className="w-3 h-3" />
                  Stakeholders
                </div>
                <div className="flex flex-wrap gap-2">
                  {agenda.stakeholders.map((person, idx) => (
                    <span key={idx} className="inline-block px-2 py-1 bg-white border border-zinc-200 rounded-md text-xs font-medium text-zinc-700 shadow-sm">
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative pl-8 md:pl-0">
          {/* Vertical Line */}
          <div className="absolute left-0 md:left-24 top-4 bottom-4 w-px bg-zinc-200 hidden md:block"></div>
          
          <div className="space-y-8">
            {agenda.agendaItems.map((item, index) => (
              <div key={index} className="relative flex flex-col md:flex-row gap-8 group">
                
                {/* Time Column */}
                <div className="md:w-24 flex-shrink-0 flex md:flex-col items-center md:items-end justify-start pt-1 md:text-right">
                  <span className="text-sm font-bold text-zinc-900 bg-zinc-50 md:bg-transparent px-2 md:px-0 rounded z-10">{item.time}</span>
                  <span className="text-xs text-zinc-400 mt-0.5 ml-2 md:ml-0">{item.duration}</span>
                </div>

                {/* Timeline Dot */}
                <div className="absolute left-[-5px] md:left-[91px] top-1.5 w-3 h-3 rounded-full border-2 border-zinc-300 bg-white group-hover:border-blue-500 group-hover:scale-110 transition-all z-10 hidden md:block"></div>

                {/* Content Card */}
                <div className="flex-1">
                  <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group-hover:border-zinc-300">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-zinc-900">{item.topic}</h3>
                      <span className="text-xs font-medium px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md">
                        {item.presenter}
                      </span>
                    </div>
                    <p className="text-zinc-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

           {/* End Dot */}
           <div className="absolute md:left-[92px] bottom-0 w-2 h-2 rounded-full bg-zinc-200 hidden md:block"></div>
        </div>
      </div>
    </div>
  );
};

export default AgendaTimeline;
