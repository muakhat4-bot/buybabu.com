'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@villex/ui';

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export function MediaPanel() {
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<'all' | 'image' | 'video' | 'document'>('all');
  const [isDragging, setIsDragging] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchAttachments = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/attachments?type=${selectedType}&q=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAttachments(data);
      }
    } catch (err) {
      console.error('Failed to fetch attachments:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedType, searchQuery]);

  React.useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.error(`Failed to upload ${file.name}`);
        }
      }
      fetchAttachments();
    } catch (err) {
      console.error('Failed to upload files:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file? This will remove it permanently.')) return;
    try {
      const response = await fetch(`/api/attachments?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setAttachments((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete attachment:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUploadFiles(e.dataTransfer.files);
  };

  const handleCopyLink = (url: string, id: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return '🖼️';
    if (mime.startsWith('video/')) return '🎥';
    if (mime.startsWith('audio/')) return '🎵';
    if (mime.includes('pdf')) return '📄';
    if (mime.includes('zip') || mime.includes('rar')) return '📦';
    return '📎';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black tracking-wider uppercase text-foreground">
          File Storage & Media Manager
        </h2>
        <p className="text-xs text-muted-foreground">
          Upload and manage product catalog images, marketing videos, and vendor verification documents.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        {/* Upload Panel */}
        <div className="lg:col-span-1">
          <Card className="border-border/80 bg-card/45 h-full">
            <CardHeader>
              <CardTitle className="text-xs font-black uppercase tracking-wider">Upload New Assets</CardTitle>
              <CardDescription className="text-[10px]">Images, videos, or documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 min-h-[220px] ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-95'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/10'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleUploadFiles(e.target.files)}
                  multiple
                  className="hidden"
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center text-xl shadow-md border border-border/80">
                      ☁️
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground">Drag & Drop Files</p>
                      <p className="text-[10px] text-muted-foreground">or click to browse local files</p>
                    </div>
                    <span className="text-[9px] font-semibold text-muted-foreground/80 bg-secondary/60 px-2 py-0.5 rounded border border-border/60 uppercase">Max 50MB</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Media Gallery */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search and Filters */}
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3 top-3 text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search files by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 bg-secondary/30 border border-input rounded-xl pl-9 pr-4 text-xs font-semibold placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>

            {/* Type tabs */}
            <div className="flex items-center space-x-1 bg-secondary/20 border border-border/60 p-1 rounded-xl w-full sm:w-auto">
              {(['all', 'image', 'video', 'document'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex-grow sm:flex-grow-0 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    selectedType === type
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <Card className="border-border/80 bg-card/45">
            <CardContent className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <svg className="animate-spin h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Loading Library...</span>
                </div>
              ) : attachments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <span className="text-4xl">📂</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">No files found</p>
                    <p className="text-[10px] text-muted-foreground">Upload files on the left panel to populate the media library.</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {attachments.map((file) => {
                    const isImg = file.fileType.startsWith('image/');
                    return (
                      <div
                        key={file.id}
                        className="group bg-card border border-border/80 hover:border-primary/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative"
                      >
                        {/* Thumbnail View */}
                        <div className="aspect-square w-full bg-secondary/30 relative flex items-center justify-center border-b border-border/40 overflow-hidden">
                          {isImg ? (
                            <img
                              src={file.fileUrl}
                              alt={file.fileName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="text-3xl select-none">{getFileIcon(file.fileType)}</div>
                          )}
                          
                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleCopyLink(file.fileUrl, file.id)}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center text-xs transition-colors"
                              title="Copy URL"
                            >
                              {copiedId === file.id ? '✓' : '🔗'}
                            </button>
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center text-xs transition-colors"
                              title="View file"
                            >
                              👁️
                            </a>
                            <button
                              onClick={() => handleDeleteAttachment(file.id)}
                              className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-400 flex items-center justify-center text-xs transition-colors"
                              title="Delete permanently"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* File Details */}
                        <div className="p-2.5 flex-grow flex flex-col justify-between">
                          <p
                            className="text-[10px] font-bold text-foreground truncate w-full"
                            title={file.fileName}
                          >
                            {file.fileName}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[9px] font-semibold text-muted-foreground">
                            <span>{formatBytes(file.fileSize)}</span>
                            <span className="uppercase">{file.fileType.split('/')[1] || 'FILE'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
