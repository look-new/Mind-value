/**
 * ============================================
 * 思维金库 (Mind Vault) - 主应用组件
 * ============================================
 *
 * 这是一个用于收藏和整理网络学习资源的应用
 * 可以保存文章、视频、播客、推文等各种内容
 * 数据会保存在浏览器本地，不会丢失
 */

import { useState, useEffect, useRef } from 'react';
import './App.css';
import { Plus, Search, Layers, Video, Mic, FileText, Twitter, BrainCircuit } from 'lucide-react';
import type { Resource } from './types';
import { ResourceType } from './types';
import { ResourceCard } from './components/ResourceCard';
import { AddResourceModal } from './components/AddResourceModal';

/**
 * ============================================
 * 示例数据
 * ============================================
 *
 * 当用户第一次使用应用，没有任何收藏时
 * 会显示这些示例内容，帮助用户了解应用的功能
 */
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

/**
 * ============================================
 * 主应用组件
 * ============================================
 *
 * 这是整个应用的入口点
 * 包含所有的业务逻辑和用户界面
 */
export default function App() {
  /**
   * ============================================
   * 状态变量 - 存储应用数据
   * ============================================
   *
   * 状态就像是贴在冰箱上的便签
   * 记录着当前应用的各种信息
   */

  // 【资源列表】存储用户收藏的所有内容
  const [resources, setResources] = useState<Resource[]>(() => {
    try {
      // 尝试从浏览器本地存储读取数据
      const saved = localStorage.getItem('mindvault_resources');
      if (saved) {
        // 如果有保存的数据，就使用它
        return JSON.parse(saved);
      }
      // 如果没有保存的数据，就显示示例
      return SAMPLE_DATA;
    } catch (e) {
      console.error('读取本地数据失败，将使用示例数据。', e);
      return SAMPLE_DATA;
    }
  });

  // 【筛选类型】当前选择的内容类型（全部/视频/文章/推文/音频）
  const [filterType, setFilterType] = useState<ResourceType | 'ALL'>('ALL');

  // 【搜索关键词】用户在搜索框输入的文字
  const [searchQuery, setSearchQuery] = useState('');

  // 【添加弹窗】是否显示"添加新内容"的弹窗
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 【标签筛选】当前选择的标签（用于筛选特定标签的内容）
  const [selectedTag, setSelectedTag] = useState<string | 'ALL'>('ALL');

  // 【排序方式】内容的排列顺序（最新在前/最早在前）
  const [sortKey, setSortKey] = useState<'createdAt_desc' | 'createdAt_asc'>('createdAt_desc');

  // 【文件输入引用】用于触发隐藏的文件选择框
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * ============================================
   * 自动保存功能
   * ============================================
   *
   * 每次 resources 变化时，自动保存到浏览器本地
   * 这样刷新页面或关闭浏览器后，数据不会丢失
   */
  useEffect(() => {
    try {
      localStorage.setItem('mindvault_resources', JSON.stringify(resources));
    } catch (e) {
      console.error('保存本地数据失败。', e);
    }
  }, [resources]);

  /**
   * ============================================
   * 添加新资源
   * ============================================
   *
   * 当用户点击"添加内容"并填写表单后
   * 这个函数会创建一条新的收藏记录
   *
   * @param data - 用户在表单中填写的新内容数据
   */
  const handleAddResource = (data: Partial<Resource>) => {
    // 创建新资源的完整对象
    const newResource: Resource = {
      id: crypto.randomUUID(),  // 生成一个唯一的ID
      createdAt: Date.now(),   // 记录创建时间
      title: data.title || '无标题',
      url: data.url || '#',
      type: data.type || ResourceType.ARTICLE,
      platform: data.platform || '未知',
      summary: data.summary || '',
      tags: data.tags || [],
      userNotes: data.userNotes || '',
      contentRaw: data.contentRaw || ''
    };
    // 把新资源加到列表最前面
    setResources(prev => [newResource, ...prev]);
  };

  /**
   * ============================================
   * 删除资源
   * ============================================
   *
   * 当用户点击删除按钮时
   * 先弹出确认提示，确认后才真正删除
   *
   * @param id - 要删除的资源的唯一ID
   */
  const handleDeleteResource = (id: string) => {
    if (confirm('您确定要删除此资源吗？')) {
      // 从列表中过滤掉这个ID的内容
      setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  /**
   * ============================================
   * 更新笔记
   * ============================================
   *
   * 当用户在资源卡片上编辑自己的笔记时
   * 更新对应资源的笔记内容
   *
   * @param id - 要更新笔记的资源ID
   * @param notes - 新的笔记内容
   */
  const handleUpdateNotes = (id: string, notes: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, userNotes: notes } : r));
  };

  /**
   * ============================================
   * 收集所有标签
   * ============================================
   *
   * 从所有资源中提取出所有出现过的标签
   * 去掉重复的，然后展示在筛选区域
   */
  const allTags = Array.from(
    new Set(
      resources.flatMap(r => r.tags || [])
    )
  );

  /**
   * ============================================
   * 筛选和排序资源
   * ============================================
   *
   * 根据用户选择的各种条件（类型、搜索、标签）
   * 过滤出符合条件的资源列表
   * 然后按照选择的排序方式进行排列
   */
  const filteredResources = resources
    .filter(r => {
      // 1. 检查类型是否匹配（"全部"类型会匹配所有）
      const matchesType = filterType === 'ALL' || r.type === filterType;

      // 2. 检查搜索关键词（会在标题、摘要、笔记、平台、标签中搜索）
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||  // 如果没有输入关键词，就匹配所有
        r.title.toLowerCase().includes(q) ||
        (r.summary && r.summary.toLowerCase().includes(q)) ||
        (r.userNotes && r.userNotes.toLowerCase().includes(q)) ||
        r.platform.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q));

      // 3. 检查标签是否匹配
      const matchesTag = selectedTag === 'ALL' || r.tags.includes(selectedTag);

      // 只有同时满足所有条件，才算匹配
      return matchesType && matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      // 按照创建时间排序
      if (sortKey === 'createdAt_desc') {
        return b.createdAt - a.createdAt;  // 降序：最新的在前
      }
      return a.createdAt - b.createdAt;    // 升序：最早的在前
    });

  /**
   * ============================================
   * 导出数据为 JSON 文件
   * ============================================
   *
   * 将所有收藏内容导出为一个 JSON 文件
   * 可以用来备份或迁移数据
   */
  const handleExport = () => {
    if (!resources.length) return;

    // 创建一个包含所有数据的 Blob 对象
    const blob = new Blob([JSON.stringify(resources, null, 2)], {
      type: 'application/json;charset=utf-8'
    });

    // 生成一个临时下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindvault-backup-${new Date().toISOString().slice(0, 10)}.json`;

    // 触发下载，然后清理
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  /**
   * ============================================
   * 触发导入文件选择
   * ============================================
   *
   * 点击"导入 JSON"按钮时
   * 触发隐藏的文件输入框
   */
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * ============================================
   * 导入 JSON 文件
   * ============================================
   *
   * 当用户选择了一个 JSON 文件后
   * 读取文件内容，解析并替换当前的数据
   *
   * @param event - 文件选择事件
   */
  const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 使用文件读取器读取文件内容
    const reader = new FileReader();
    reader.onload = () => {
      try {
        // 尝试解析 JSON
        const parsed = JSON.parse(reader.result as string);

        // 检查格式是否正确
        if (!Array.isArray(parsed)) {
          alert('导入失败：JSON 格式不正确，应为资源数组。');
          return;
        }

        // 标准化数据格式（确保每个资源都有必要的字段）
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

        // 替换当前数据
        setResources(normalized);
        alert('导入成功，已替换当前列表。');
      } catch (e) {
        console.error(e);
        alert('导入失败：无法解析 JSON。');
      } finally {
        // 重置文件输入，允许下次选择同一个文件
        event.target.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // ============================================
  // 以下是用户界面的渲染部分
  // return 后面的是实际的 HTML（JSX）代码
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/*
       * ============================================
       * 顶部导航栏
       * ============================================
       */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo 和应用名称 */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">思维金库</h1>
          </div>

          {/* 桌面端搜索框 - 仅在大屏幕上显示 */}
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

          {/* 添加内容按钮 */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-gray-900/20"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">添加内容</span>
          </button>
        </div>
      </header>

      {/*
       * ============================================
       * 移动端搜索框 - 仅在小屏幕上显示
       * ============================================
       */}
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

      {/*
       * ============================================
       * 主内容区域
       * ============================================
       */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">

        {/*
         * ============================================
         * 左侧边栏 - 分类筛选
         * ============================================
         */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">收藏分类</h2>

            {/* 分类按钮列表 */}
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
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                      : 'text-slate-500 hover:bg-blue-50/50 hover:text-blue-600 font-medium'
                  }`}
                >
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive
                        ? 'text-blue-600'
                        : 'text-slate-400 group-hover:text-blue-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/*
             * ============================================
             * 每周洞察卡片
             * ============================================
             */}
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

        {/*
         * ============================================
         * 右侧内容区 - 资源卡片列表
         * ============================================
         */}
        <div className="flex-grow">
          {/* 标题栏和筛选信息 */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">
              {filterType === 'ALL' ? '全部内容' :
               filterType === 'VIDEO' ? '视频' :
               filterType === 'AUDIO' ? '音频' :
               filterType === 'TWEET' ? '微内容' : '文章'}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">{filteredResources.length} 个结果</span>
              {/* 排序选择下拉框 */}
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

          {/*
           * ============================================
           * 标签筛选区域
           * ============================================
           */}
          {allTags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2 items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-1">标签筛选:</span>
              {/* "全部"标签按钮 */}
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
              {/* 其他标签按钮 */}
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

          {/*
           * ============================================
           * 空状态 - 当没有内容时显示
           * ============================================
           */}
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
            /*
             * ============================================
             * 资源卡片网格
             * ============================================
             */
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

      {/*
       * ============================================
       * 页脚 - 导入/导出功能
       * ============================================
       */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">本地知识库</span>
            <span>数据仅保存在你的浏览器 LocalStorage 中。</span>
          </div>
          <div className="flex items-center gap-2">
            {/* 导出按钮 */}
            <button
              onClick={handleExport}
              className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              导出 JSON 备份
            </button>
            {/* 导入按钮 */}
            <button
              onClick={handleImportClick}
              className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              导入 JSON
            </button>
            {/* 隐藏的文件输入框 */}
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

      {/*
       * ============================================
       * 添加资源弹窗
       * ============================================
       */}
      <AddResourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddResource}
      />
    </div>
  );
}
