import React, { useState } from 'react';
import { ResourceType } from '../types';
import { analyzeContent } from '../services/deepseekService';
import { Loader2, X, Wand2 } from 'lucide-react';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('X');
  const [type, setType] = useState<ResourceType>(ResourceType.ARTICLE);
  const [contentRaw, setContentRaw] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      // 1. Call DeepSeek to get summary and tags
      const analysis = await analyzeContent(title, contentRaw || "No detailed content provided", type);

      // 2. Construct new resource
      const newResource = {
        title,
        url,
        platform,
        type,
        contentRaw,
        summary: analysis.summary,
        tags: analysis.suggestedTags,
        userNotes: '',
      };

      onAdd(newResource);
      
      // Reset
      setUrl('');
      setTitle('');
      setContentRaw('');
      setIsAnalyzing(false);
      onClose();

    } catch (error) {
      console.error("Failed to add resource", error);
      setIsAnalyzing(false);
    }
  };

  const typeLabels: Record<ResourceType, string> = {
    [ResourceType.ARTICLE]: '文章',
    [ResourceType.VIDEO]: '视频',
    [ResourceType.AUDIO]: '音频',
    [ResourceType.TWEET]: '短内容 (推文/微博)'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">添加到知识库</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto no-scrollbar space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as ResourceType)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Object.values(ResourceType).map(t => (
                  <option key={t} value={t}>{typeLabels[t] || t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">平台</label>
              <input 
                type="text" 
                list="platforms"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="例如：知乎, Bilibili"
              />
              <datalist id="platforms">
                <option value="X" />
                <option value="Zhihu" />
                <option value="Douyin" />
                <option value="Youtube" />
                <option value="Bilibili" />
                <option value="WeChat" />
                <option value="Weibo" />
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">链接地址 (URL)</label>
            <input 
              type="url" 
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="这篇内容关于什么？"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              内容 / 描述 
              <span className="text-gray-400 font-normal ml-2 text-xs">(粘贴文本以便 AI 生成更好的摘要)</span>
            </label>
            <textarea 
              value={contentRaw}
              onChange={(e) => setContentRaw(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none h-32"
              placeholder="在此粘贴推文内容、文章片段或您自己的描述..."
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isAnalyzing}
              className={`w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${isAnalyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl shadow-blue-500/30'}`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  AI 正在分析中...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  智能分析并添加
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              DeepSeek 将根据您的输入自动生成摘要和标签。
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};