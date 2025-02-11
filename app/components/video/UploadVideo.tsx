import { useState, useCallback } from 'react';
import * as qiniujs from 'qiniu-js';

interface UploadVideoProps {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export default function UploadVideo({ onSuccess, onError }: UploadVideoProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadToQiniu = useCallback(async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      // 1. 从我们的服务器获取上传凭证
      const tokenRes = await fetch('/api/videos/token');
      const { token, domain } = await tokenRes.json();

      if (!token) {
        throw new Error('获取上传凭证失败');
      }

      // 2. 生成文件名
      const key = `videos/${Date.now()}-${file.name}`;

      // 3. 使用七牛云 SDK 上传
      const observable = qiniujs.upload(file, key, token, {}, {
        useCdnDomain: true,
      });

      // 4. 处理上传过程
      observable.subscribe({
        next(res) {
          setProgress(res.total.percent.toFixed(2));
        },
        error(err) {
          setUploading(false);
          onError?.(err);
        },
        complete(res) {
          const url = `${domain}/${res.key}`;
          setUploading(false);
          onSuccess?.(url);
        },
      });
    } catch (error) {
      setUploading(false);
      onError?.(error as Error);
    }
  }, [onSuccess, onError]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('video/')) {
      onError?.(new Error('只支持视频文件'));
      return;
    }

    // 验证文件大小（500MB）
    if (file.size > 500 * 1024 * 1024) {
      onError?.(new Error('文件大小不能超过 500MB'));
      return;
    }

    uploadToQiniu(file);
  }, [uploadToQiniu, onError]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      onError?.(new Error('只支持视频文件'));
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      onError?.(new Error('文件大小不能超过 500MB'));
      return;
    }

    uploadToQiniu(file);
  }, [uploadToQiniu, onError]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
        id="video-upload"
      />
      <label
        htmlFor="video-upload"
        className="cursor-pointer block"
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="text-lg">正在上传... {progress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl">📹</div>
            <div className="text-lg">点击或拖拽视频文件到这里上传</div>
            <div className="text-sm text-gray-500">
              支持的格式：MP4、WebM 等<br />
              最大文件大小：500MB
            </div>
          </div>
        )}
      </label>
    </div>
  );
} 