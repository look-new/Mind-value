import { useState, useEffect, useRef } from 'react';
import './App.css';
import { Plus, Search, Layers, Video, Mic, FileText, Twitter, BrainCircuit } from 'lucide-react';
import type { Resource } from './types';
import { ResourceType } from './types';
import { ResourceCard } from './components/ResourceCard';
import { AddResourceModal } from './components/AddResourceModal';

const SAMPLE_DATA: Resource[] = [
  {
    id: '1',
    title: '深入理解 React Server Components',
    url: 'https://react.dev',
    type: ResourceType.ARTICLE,
    platform: 'Official Docs',
    summary: '深入探讨 RSC 如何改变现代 Web 开发中的数据获取范式，重点在于服务器端渲染的优势。',
    userNotes: '关键点：通过在服务器上渲染来减小 Bundle 体积。',
    tags: ['React', '前端', '性能优化'],
    createdAt: Date.now(),
    contentRaw: 'React Server Components allow developers to write components that run exclusively on the server.'
  },
  {
    id: '2',
    title: 'AI 智能体的未来',
    url: 'https://twitter.com',
    type: ResourceType.TWEET,
    platform: 'X',
    summary: '讨论自主智能体（Autonomous Agents）将如何取代传统的 SaaS 工作流，成为新的应用形态。',
    userNotes: '',
    tags: ['AI', '未来科技', 'Agent'],
    createdAt: Date.now() - 100000,
    contentRaw: 'Agents are the new apps.'
  }
];

export default function App() {
  // Lazy Initialization: 在 useState 初始化时直接读取 localStorage
  const [resources, setResources] = useState<Resource[]>(() => {
    try {
      const saved = localStorage.getItem('mindvault_resources');
      if (saved) {
        return JSON.parse(saved);
      }
      return SAMPLE_DATA;
    } catch (e) {
      console.error('读取本地数据失败，将使用示例数据。', e);
      return SAMPLE_DATA;
    }
  });
  const [filterType, setFilterType] = useState<ResourceType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | 'ALL'>('ALL');
  const [sortKey, setSortKey] = useState<'createdAt_desc' | 'createdAt_asc'>('createdAt_desc');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('mindvault_resources', JSON.stringify(resources));
    } catch (e) {
      console.error('保存本地数据失败。', e);
    }
  }, [resources]);

  const handleAddResource = (data: Partial<Resource>) => {
    const newResource: Resource = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      title: data.title || '无标题',
      url: data.url || '#',
      type: data.type || ResourceType.ARTICLE,
      platform: data.platform || '未知',
      summary: data.summary || '',
      tags: data.tags || [],
      userNotes: data.userNotes || '',
      contentRaw: data.contentRaw || ''
    };
    setResources(prev => [newResource, ...prev]);
  };

  const handleDeleteResource = (id: string) => {
    if (confirm('您确定要删除此资源吗？')) {
      setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, userNotes: notes } : r));
  };

  const allTags = Array.from(
    new Set(
      resources.flatMap(r => r.tags || [])
    )
  );

  const filteredResources = resources
    .filter(r => {
    const matchesType = filterType === 'ALL' || r.type === filterType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        (r.summary && r.summary.toLowerCase().includes(q)) ||
        (r.userNotes && r.userNotes.toLowerCase().includes(q)) ||
        r.platform.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q));
      const matchesTag = selectedTag === 'ALL' || r.tags.includes(selectedTag);
      return matchesType && matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortKey === 'createdAt_desc') {
        return b.createdAt - a.createdAt;
      }
      return a.createdAt - b.createdAt;
    });

  const handleExport = () => {
    if (!resources.length) return;
    const blob = new Blob([JSON.stringify(resources, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed)) {
          alert('导入失败：JSON 格式不正确，应为资源数组。');
          return;
        }

        const normalized: Resource[] = parsed.map((item: any) => ({
          id: item.id || crypto.randomUUID(),
          createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
          title: item.title || '无标题',
          url: item.url || '#',
          type: item.type || ResourceType.ARTICLE,
          platform: item.platform || '未知',
          summary: item.summary || '',
          userNotes: item.userNotes || '',
          tags: Array.isArray(item.tags) ? item.tags : [],
          contentRaw: item.contentRaw || ''
        }));

        setResources(normalized);
        alert('导入成功，已替换当前列表。');
      } catch (e) {
        console.error(e);
        alert('导入失败：无法解析 JSON。');
      } finally {
        // 允许下次选择同一个文件
        event.target.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">思维金库</h1>
          </div>
          
          <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text"
              placeholder="搜索标题或标签..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-gray-900/20"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">添加内容</span>
          </button>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input 
            type="text"
            placeholder="搜索..."
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">收藏分类</h2>
            
            {[
              { id: 'ALL', label: '全部内容', icon: Layers },
              { id: ResourceType.VIDEO, label: '视频', icon: Video },
              { id: ResourceType.ARTICLE, label: '文章', icon: FileText },
              { id: ResourceType.TWEET, label: '推文 / 短内容', icon: Twitter },
              { id: ResourceType.AUDIO, label: '音频 / 播客', icon: Mic },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = filterType === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setFilterType(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'  // 选中：保持原来的蓝色高亮
                      : 'text-slate-500 hover:bg-blue-50/50 hover:text-blue-600 font-medium' // 未选中：由"黑"改为"柔和灰"，悬停变蓝
                  }`}
                >
                  <Icon 
                    size={18} 
                    className={`transition-colors ${
                      isActive 
                        ? 'text-blue-600' 
                        : 'text-slate-400 group-hover:text-blue-500' // 图标：未选中时是浅灰，悬停也跟着变蓝
                    }`} 
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-6 px-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg shadow-blue-500/20">
                <h3 className="font-bold mb-1">每周洞察</h3>
                <p className="text-xs text-blue-50 opacity-90 leading-relaxed font-medium">
                  "学而不思则罔，思而不学则殆。"
                </p>
                <div className="mt-3 text-xs font-bold bg-white/20 inline-block px-2.5 py-1 rounded-md backdrop-blur-sm">
                  已收录 {resources.length} 条内容
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Grid Content */}
        <div className="flex-grow">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">
              {filterType === 'ALL' ? '全部内容' : 
               filterType === 'VIDEO' ? '视频' :
               filterType === 'AUDIO' ? '音频' :
               filterType === 'TWEET' ? '微内容' : '文章'}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">{filteredResources.length} 个结果</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-slate-600"
              >
                <option value="createdAt_desc">最新在前</option>
                <option value="createdAt_asc">最早在前</option>
              </select>
            </div>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2 items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-1">标签筛选:</span>
              <button
                onClick={() => setSelectedTag('ALL')}
                className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${
                  selectedTag === 'ALL'
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                全部
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${
                    selectedTag === tag
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {filteredResources.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="text-slate-300 w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">未找到内容</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                通过添加网络上的有趣文章、视频或想法来构建您的知识库。
              </p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 text-brand-600 font-medium hover:text-brand-700"
              >
                添加第一条内容 &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredResources.map(resource => (
                <ResourceCard 
                  key={resource.id} 
                  resource={resource} 
                  onDelete={handleDeleteResource}
                  onUpdateNotes={handleUpdateNotes}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Import / Export JSON (local backup) */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">本地知识库</span>
            <span>数据仅保存在你的浏览器 LocalStorage 中。</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              导出 JSON 备份
            </button>
            <button
              onClick={handleImportClick}
              className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              导入 JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportChange}
            />
          </div>
        </div>
      </footer>

      <AddResourceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddResource}
      />
    </div>
  );
}