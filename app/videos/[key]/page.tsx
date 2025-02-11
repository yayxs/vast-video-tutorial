'use client';

import { useEffect, useState } from 'react';

interface VideoDetails {
  key: string;
  title: string;
  url: string;
  createTime: number;
  size: number;
  mimeType: string;
}

export default function VideoPage({ params }: { params: { key: string } }) {
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const response = await fetch(`/api/videos/${params.key}`);
        const data = await response.json();
        if (data.success) {
          setVideo(data.video);
        }
      } catch (error) {
        console.error('获取视频详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [params.key]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">
          视频不存在或已被删除
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 视频播放器 */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-6">
          <video
            src={video.url}
            controls
            autoPlay
            className="w-full h-full"
            controlsList="nodownload"
            playsInline
          />
        </div>

        {/* 视频信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
          
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span>上传时间：{new Date(video.createTime).toLocaleString()}</span>
            <span>•</span>
            <span>大小：{Math.round(video.size / 1024 / 1024 * 100) / 100}MB</span>
          </div>
        </div>
      </div>
    </main>
  );
} 