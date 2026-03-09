/**
 * MindVault - 思维金库
 * 纯 JavaScript + HTML + CSS 版本
 */

(function () {
  'use strict';

  var ResourceType = {
    ARTICLE: 'ARTICLE',
    VIDEO: 'VIDEO',
    AUDIO: 'AUDIO',
    TWEET: 'TWEET'
  };

  var SAMPLE_DATA = [
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

  var state = {
    resources: loadResources(),
    filterType: 'ALL',
    searchQuery: '',
    selectedTag: 'ALL',
    sortKey: 'createdAt_desc'
  };

  function loadResources() {
    try {
      var saved = localStorage.getItem('mindvault_resources');
      if (saved) {
        return JSON.parse(saved);
      }
      return JSON.parse(JSON.stringify(SAMPLE_DATA));
    } catch (e) {
      console.error('读取本地数据失败，将使用示例数据。', e);
      return JSON.parse(JSON.stringify(SAMPLE_DATA));
    }
  }

  function saveResources() {
    try {
      localStorage.setItem('mindvault_resources', JSON.stringify(state.resources));
    } catch (e) {
      console.error('保存本地数据失败。', e);
    }
  }

  function getFilteredResources() {
    var q = state.searchQuery.toLowerCase().trim();
    return state.resources
      .filter(function (r) {
        var matchesType = state.filterType === 'ALL' || r.type === state.filterType;
        var matchesSearch = !q ||
          (r.title || '').toLowerCase().includes(q) ||
          (r.summary || '').toLowerCase().includes(q) ||
          (r.userNotes || '').toLowerCase().includes(q) ||
          (r.platform || '').toLowerCase().includes(q) ||
          (r.tags || []).some(function (t) { return t.toLowerCase().includes(q); });
        var matchesTag = state.selectedTag === 'ALL' || (r.tags || []).includes(state.selectedTag);
        return matchesType && matchesSearch && matchesTag;
      })
      .sort(function (a, b) {
        if (state.sortKey === 'createdAt_desc') {
          return b.createdAt - a.createdAt;
        }
        return a.createdAt - b.createdAt;
      });
  }

  function getAllTags() {
    var tags = new Set();
    state.resources.forEach(function (r) {
      (r.tags || []).forEach(function (t) { tags.add(t); });
    });
    return Array.from(tags);
  }

  function getTypeIcon(type) {
    var icons = {
      VIDEO: '<svg class="type-icon video" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
      AUDIO: '<svg class="type-icon audio" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
      TWEET: '<svg class="type-icon tweet" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>',
      ARTICLE: '<svg class="type-icon article" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>'
    };
    return icons[type] || icons.ARTICLE;
  }

  function getPlatformClass(platform) {
    var map = { youtube: 'youtube', bilibili: 'bilibili', twitter: 'twitter', x: 'x', zhihu: 'zhihu', douyin: 'douyin' };
    var key = (platform || '').toLowerCase();
    return 'platform-badge ' + (map[key] || 'default');
  }

  function renderResourceCard(r) {
    var expandedId = document.body.getAttribute('data-expanded-id') || '';
    var editingId = document.body.getAttribute('data-editing-id') || '';
    var isExpanded = expandedId === r.id || r.userNotes;
    var isEditing = editingId === r.id;

    var notesHtml = '';
    if (isEditing) {
      notesHtml = '<div class="notes-edit"><textarea data-id="' + r.id + '" class="notes-input">' + escapeHtml(r.userNotes || '') + '</textarea><div class="notes-edit-btns"><button class="btn-cancel" data-id="' + r.id + '">取消</button><button class="btn-save" data-id="' + r.id + '">保存笔记</button></div></div>';
    } else {
      var displayContent = r.userNotes ? escapeHtml(r.userNotes) : '<span class="notes-placeholder">点击添加笔记...</span>';
      notesHtml = '<div class="notes-display" data-id="' + r.id + '">' + displayContent + '<svg class="edit-hint" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>';
    }

    var tagsHtml = (r.tags || []).map(function (t) {
      return '<span class="card-tag">#' + escapeHtml(t) + '</span>';
    }).join('');

    return '<div class="resource-card" data-id="' + r.id + '">' +
      '<div class="card-body">' +
        '<div class="card-top">' +
          '<div class="card-badges">' +
            '<span class="' + getPlatformClass(r.platform) + '">' + escapeHtml(r.platform || '未知') + '</span>' +
            getTypeIcon(r.type) +
          '</div>' +
          '<div class="card-actions">' +
            '<a href="' + escapeAttr(r.url) + '" target="_blank" rel="noopener noreferrer" title="打开链接"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg></a>' +
            '<button class="btn-delete" data-id="' + r.id + '" title="删除"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>' +
          '</div>' +
        '</div>' +
        '<h3 class="card-title">' + escapeHtml(r.title) + '</h3>' +
        '<div class="ai-summary">' +
          '<p class="ai-summary-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>AI 智能摘要</p>' +
          '<p class="ai-summary-text">' + escapeHtml(r.summary || '暂无摘要。') + '</p>' +
        '</div>' +
        '<div class="card-tags">' + tagsHtml + '</div>' +
        '<div class="card-notes">' +
          '<button class="notes-toggle" data-id="' + r.id + '"><span>我的思考与笔记</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="' + (isExpanded ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6') + '"/></svg></button>' +
          '<div class="notes-content ' + (isExpanded ? '' : 'hidden') + '">' + notesHtml + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (!str) return '#';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML.replace(/"/g, '&quot;');
  }

  function render() {
    var filtered = getFilteredResources();
    var allTags = getAllTags();

    document.getElementById('resourceCount').textContent = '已收录 ' + state.resources.length + ' 条内容';
    document.getElementById('resultCount').textContent = filtered.length + ' 个结果';

    var typeLabels = { ALL: '全部内容', VIDEO: '视频', AUDIO: '音频', TWEET: '微内容', ARTICLE: '文章' };
    document.getElementById('contentTitle').textContent = typeLabels[state.filterType] || '全部内容';

    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.type === state.filterType);
    });

    var tagFilters = document.getElementById('tagFilters');
    if (allTags.length > 0) {
      tagFilters.classList.remove('hidden');
      tagFilters.innerHTML = '<span class="tag-label">标签筛选:</span>' +
        '<button class="tag-btn' + (state.selectedTag === 'ALL' ? ' active' : '') + '" data-tag="ALL">全部</button>' +
        allTags.map(function (t) {
          return '<button class="tag-btn' + (state.selectedTag === t ? ' active' : '') + '" data-tag="' + escapeAttr(t) + '">#' + escapeHtml(t) + '</button>';
        }).join('');
    } else {
      tagFilters.classList.add('hidden');
    }

    var grid = document.getElementById('resourceGrid');
    var emptyState = document.getElementById('emptyState');

    if (filtered.length === 0) {
      grid.classList.add('hidden');
      emptyState.classList.remove('hidden');
    } else {
      grid.classList.remove('hidden');
      emptyState.classList.add('hidden');
      grid.innerHTML = filtered.map(renderResourceCard).join('');
    }
  }

  function handleAddResource(data) {
    var newResource = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now(),
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
    state.resources.unshift(newResource);
    saveResources();
    render();
  }

  function handleDeleteResource(id) {
    if (confirm('您确定要删除此资源吗？')) {
      state.resources = state.resources.filter(function (r) { return r.id !== id; });
      saveResources();
      render();
    }
  }

  function handleUpdateNotes(id, notes) {
    var r = state.resources.find(function (x) { return x.id === id; });
    if (r) {
      r.userNotes = notes;
      saveResources();
      document.body.removeAttribute('data-editing-id');
      render();
    }
  }

  function bindEvents() {
    document.getElementById('searchInput').addEventListener('input', function () {
      state.searchQuery = this.value;
      render();
    });
    document.getElementById('searchInputMobile').addEventListener('input', function () {
      state.searchQuery = this.value;
      render();
    });

    document.getElementById('addBtn').addEventListener('click', function () {
      document.getElementById('addModal').classList.remove('hidden');
    });

    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.filterType = this.dataset.type;
        render();
      });
    });

    document.getElementById('sortSelect').addEventListener('change', function () {
      state.sortKey = this.value;
      render();
    });

    document.getElementById('exportBtn').addEventListener('click', function () {
      if (!state.resources.length) return;
      var blob = new Blob([JSON.stringify(state.resources, null, 2)], { type: 'application/json;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'mindvault-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    document.getElementById('importBtn').addEventListener('click', function () {
      document.getElementById('importInput').click();
    });

    document.getElementById('importInput').addEventListener('change', function () {
      var file = this.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(reader.result);
          if (!Array.isArray(parsed)) {
            alert('导入失败：JSON 格式不正确，应为资源数组。');
            return;
          }
          state.resources = parsed.map(function (item) {
            return {
              id: item.id || (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now()),
              createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
              title: item.title || '无标题',
              url: item.url || '#',
              type: item.type || ResourceType.ARTICLE,
              platform: item.platform || '未知',
              summary: item.summary || '',
              userNotes: item.userNotes || '',
              tags: Array.isArray(item.tags) ? item.tags : [],
              contentRaw: item.contentRaw || ''
            };
          });
          saveResources();
          render();
          alert('导入成功，已替换当前列表。');
        } catch (e) {
          alert('导入失败：无法解析 JSON。');
        }
        document.getElementById('importInput').value = '';
      };
      reader.readAsText(file, 'utf-8');
    });

    document.getElementById('closeAddModal').addEventListener('click', function () {
      document.getElementById('addModal').classList.add('hidden');
    });

    document.querySelector('#addModal .modal-backdrop').addEventListener('click', function () {
      document.getElementById('addModal').classList.add('hidden');
    });

    document.getElementById('addForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var loading = document.getElementById('addLoading');
      var text = document.getElementById('addText');
      var btn = document.getElementById('addSubmitBtn');

      loading.classList.remove('hidden');
      text.classList.add('hidden');
      btn.disabled = true;

      var url = document.getElementById('addUrl').value;
      var title = document.getElementById('addTitle').value;
      var platform = document.getElementById('addPlatform').value;
      var type = document.getElementById('addType').value;
      var contentRaw = document.getElementById('addContentRaw').value;

      DeepSeekService.analyzeContent(title, contentRaw || 'No detailed content provided', type)
        .then(function (analysis) {
          handleAddResource({
            title: title,
            url: url,
            platform: platform,
            type: type,
            contentRaw: contentRaw,
            summary: analysis.summary,
            tags: analysis.suggestedTags,
            userNotes: ''
          });
          document.getElementById('addUrl').value = '';
          document.getElementById('addTitle').value = '';
          document.getElementById('addContentRaw').value = '';
          document.getElementById('addModal').classList.add('hidden');
        })
        .finally(function () {
          loading.classList.add('hidden');
          text.classList.remove('hidden');
          btn.disabled = false;
        });
    });

    document.getElementById('closeWelcomeModal').addEventListener('click', closeWelcomeModal);
    document.getElementById('welcomeOkBtn').addEventListener('click', closeWelcomeModal);
    document.querySelector('#welcomeModal .modal-backdrop').addEventListener('click', closeWelcomeModal);

    document.getElementById('emptyAddBtn').addEventListener('click', function () {
      document.getElementById('addModal').classList.remove('hidden');
    });

    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-tag]');
      if (target && target.classList.contains('tag-btn')) {
        state.selectedTag = target.dataset.tag;
        render();
      }

      target = e.target.closest('.btn-delete');
      if (target) {
        handleDeleteResource(target.dataset.id);
      }

      target = e.target.closest('.notes-toggle');
      if (target) {
        var id = target.dataset.id;
        var currentlyExpanded = document.body.getAttribute('data-expanded-id') === id;
        document.body.setAttribute('data-expanded-id', currentlyExpanded ? '' : id);
        render();
      }

      target = e.target.closest('.notes-display');
      if (target) {
        document.body.setAttribute('data-editing-id', target.dataset.id);
        render();
      }

      target = e.target.closest('.btn-cancel');
      if (target) {
        document.body.removeAttribute('data-editing-id');
        render();
      }

      target = e.target.closest('.btn-save');
      if (target) {
        var card = document.querySelector('.resource-card[data-id="' + target.dataset.id + '"]');
        var textarea = card && card.querySelector('.notes-input');
        if (textarea) {
          handleUpdateNotes(target.dataset.id, textarea.value);
        }
      }
    });

    document.addEventListener('change', function (e) {
      var target = e.target.closest('.notes-input');
      if (!target) return;
      var saveBtn = document.querySelector('.btn-save[data-id="' + target.dataset.id + '"]');
      if (saveBtn) saveBtn.disabled = false;
    });
  }

  function closeWelcomeModal() {
    document.getElementById('welcomeModal').classList.add('hidden');
    localStorage.setItem('mindvault_hasSeenWelcome', 'true');
  }

  function init() {
    if (!localStorage.getItem('mindvault_hasSeenWelcome')) {
      document.getElementById('welcomeModal').classList.remove('hidden');
    }
    render();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
