import React, { useState } from 'react';
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { marked } from 'marked';
import { useAppStore } from '../store';

export const MarkdownPanel: React.FC = () => {
  const { notes, setNotes, videoName } = useAppStore();
  const [isPreview, setIsPreview] = useState(false);

  // 渲染 Markdown
  const renderMarkdown = (text: string) => {
    try {
      return { __html: marked(text) as string };
    } catch {
      return { __html: text };
    }
  };

  // 保存笔记
  const handleSave = async () => {
    const defaultName = videoName
      ? videoName.replace(/\.[^.]+$/, '.md')
      : 'notes.md';

    const filePath = await save({
      defaultPath: defaultName,
      filters: [{ name: 'Markdown', extensions: ['md', 'txt'] }],
    });

    if (filePath) {
      try {
        await writeTextFile(filePath, notes);
        alert('笔记已保存');
      } catch (error) {
        console.error('Failed to save notes:', error);
        alert('保存失败');
      }
    }
  };

  // 加载笔记
  const handleLoad = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Markdown', extensions: ['md', 'txt'] }],
    });

    if (selected) {
      try {
        const content = await readTextFile(selected as string);
        setNotes(content);
      } catch (error) {
        console.error('Failed to load notes:', error);
        alert('加载失败');
      }
    }
  };

  // 清空笔记
  const handleClear = () => {
    if (confirm('确定要清空笔记吗？')) {
      setNotes('');
    }
  };

  return (
    <div className="markdown-panel">
      <div className="markdown-toolbar">
        <button onClick={handleSave}>💾 保存</button>
        <button onClick={handleLoad}>📂 打开</button>
        <button onClick={handleClear}>🗑️ 清空</button>
        <div className="toolbar-spacer" />
        <button
          className={isPreview ? 'active' : ''}
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? '✏️ 编辑' : '👁️ 预览'}
        </button>
      </div>

      <div className="markdown-content">
        {isPreview ? (
          <div
            className="markdown-preview"
            dangerouslySetInnerHTML={renderMarkdown(notes)}
          />
        ) : (
          <textarea
            className="markdown-editor"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="在这里用 Markdown 语法记录学习笔记...

# 示例标题
## 二级标题

- 列表项1
- 列表项2

**粗体文本**
*斜体文本*

> 引用内容

[链接](url)

```
代码块
```"
          />
        )}
      </div>
    </div>
  );
};
