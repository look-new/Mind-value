import React, { useState } from 'react';
import type { Resource } from '../types';
import { ResourceType } from '../types';
import { ExternalLink, Edit3, Trash2, Video, FileText, Mic, Twitter, ChevronDown, ChevronUp } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onDelete, onUpdateNotes }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(resource.userNotes);

  const getIcon = (type: ResourceType) => {
    switch (type) {
      case ResourceType.VIDEO: return <Video className="w-5 h-5 text-red-500" />;
      case ResourceType.AUDIO: return <Mic className="w-5 h-5 text-purple-500" />;
      case ResourceType.TWEET: return <Twitter className="w-5 h-5 text-blue-400" />;
      default: return <FileText className="w-5 h-5 text-emerald-500" />;
    }
  };

  const handleSaveNotes = () => {
    onUpdateNotes(resource.id, notesDraft);
    setIsEditingNotes(false);
  };

  const platformColors: Record<string, string> = {
    'Youtube': 'bg-red-100 text-red-800',
    'Bilibili': 'bg-pink-100 text-pink-800',
    'Twitter': 'bg-blue-100 text-blue-800',
    'X': 'bg-slate-100 text-slate-800',
    'Zhihu': 'bg-blue-50 text-blue-600',
    'Douyin': 'bg-slate-900 text-white',
    'Other': 'bg-gray-100 text-gray-800'
  };

  const badgeClass = platformColors[resource.platform] || platformColors['Other'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${badgeClass}`}>
              {resource.platform}
            </span>
            {getIcon(resource.type)}
          </div>
          <div className="flex space-x-1">
            <a 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors p-1"
              title="打开链接"
            >
              <ExternalLink size={16} />
            </a>
            <button 
              onClick={() => onDelete(resource.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="删除"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight line-clamp-2">
          {resource.title}
        </h3>

        {/* AI Summary Section */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 智能摘要
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {resource.summary || "暂无摘要。"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto mb-4">
          {resource.tags.map((tag, idx) => (
            <span key={idx} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* Expandable Notes Section */}
        <div className="border-t border-slate-100 pt-3 mt-auto">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-sm text-slate-500 hover:text-slate-800 font-medium"
          >
            <span>我的思考与笔记</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {(isExpanded || resource.userNotes) && (
             <div className={`mt-3 transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
               {isEditingNotes ? (
                 <div className="space-y-2">
                   <textarea
                     className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                     value={notesDraft}
                     onChange={(e) => setNotesDraft(e.target.value)}
                     placeholder="在这里记录您的灵感..."
                   />
                   <div className="flex justify-end gap-2">
                     <button 
                        onClick={() => setIsEditingNotes(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1"
                     >
                       取消
                     </button>
                     <button 
                        onClick={handleSaveNotes}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                     >
                       保存笔记
                     </button>
                   </div>
                 </div>
               ) : (
                 <div 
                    onClick={() => { setIsEditingNotes(true); setIsExpanded(true); }}
                    className="text-sm text-gray-700 whitespace-pre-wrap cursor-pointer hover:bg-gray-50 p-2 rounded-md -ml-2 border border-transparent hover:border-gray-200 group relative min-h-[60px]"
                 >
                   {resource.userNotes || <span className="text-gray-400 italic">点击添加笔记...</span>}
                   <Edit3 className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 w-4 h-4" />
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};