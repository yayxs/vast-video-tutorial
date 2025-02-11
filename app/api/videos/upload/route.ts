import { NextResponse } from 'next/server';
import { uploadVideo } from '@/app/lib/oss';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '没有找到视频文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: '只支持视频文件上传' },
        { status: 400 }
      );
    }

    // 验证文件大小（例如：限制为 500MB）
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过 500MB' },
        { status: 400 }
      );
    }

    // 上传到 OSS
    const url = await uploadVideo(file);

    return NextResponse.json({
      success: true,
      url,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    });
  } catch (error) {
    console.error('视频上传失败:', error);
    return NextResponse.json(
      { error: '视频上传失败' },
      { status: 500 }
    );
  }
} 