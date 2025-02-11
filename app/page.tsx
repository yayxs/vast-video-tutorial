'use client';

import { useState, useEffect } from 'react';

interface Video {
  key: string;
  title: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  createTime: number;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取视频列表
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        const data = await response.json();
        setVideos(data.videos);
      } catch (error) {
        console.error('获取视频列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.key} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* 视频预览图 */}
            <div className="relative aspect-video bg-gray-100">
              <video
                src={video.url}
                className="w-full h-full object-cover"
                poster={video.thumbnail}
                preload="none"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-black/50 rounded-full p-4 text-white hover:bg-black/70 transition-colors">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 视频信息 */}
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                {video.title}
              </h2>
              <div className="flex items-center text-sm text-gray-500">
                <span>{new Date(video.createTime).toLocaleDateString()}</span>
                {video.duration && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          暂无视频内容
        </div>
      )}
    </main>
  );
}
