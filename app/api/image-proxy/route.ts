import { NextResponse } from 'next/server';

// 允许的域名白名单
const ALLOWED_DOMAINS = [
  'i.imgur.com',
  'imgur.com',
  'images.unsplash.com',
  'unsplash.com',
  'picsum.photos',
  'githubusercontent.com',
  'github.com',
  'raw.githubusercontent.com',
  'cdn.jsdelivr.net',
  'fastly.jsdelivr.net',
  'img.shields.io',
  'shields.io',
  'via.placeholder.com',
  'placekitten.com',
  'placehold.co',
  'placeholder.com',
  'dummyimage.com',
  'res.cloudinary.com',
  'cloudinary.com',
  'media.giphy.com',
  'giphy.com',
  'tenor.com',
  'media.tenor.com',
  'pbs.twimg.com',
  'abs.twimg.com',
  'twimg.com',
  'avatars.githubusercontent.com',
  'user-images.githubusercontent.com',
  'camo.githubusercontent.com',
  'opengraph.githubassets.com',
  'repository-images.githubusercontent.com',
  'secure.gravatar.com',
  'gravatar.com',
  's.gravatar.com',
  'i.stack.imgur.com',
  'stack.imgur.com',
  'i.ytimg.com',
  'ytimg.com',
  'yt3.ggpht.com',
  'ggpht.com',
  'lh3.googleusercontent.com',
  'googleusercontent.com',
  'avatars0.githubusercontent.com',
  'avatars1.githubusercontent.com',
  'avatars2.githubusercontent.com',
  'avatars3.githubusercontent.com',
  'avatars4.githubusercontent.com',
  'avatars5.githubusercontent.com',
  'avatars6.githubusercontent.com',
  'avatars7.githubusercontent.com',
  'avatars8.githubusercontent.com',
  'zktecoaihub.com', // Add this line to allow zktecoaihub.com domain
];

// 缓存时间（24小时）
const CACHE_TIME = 60 * 60 * 24;

export async function GET(request: Request) {
  try {
    // 从查询参数中获取URL
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing URL parameter' },
        { status: 400 }
      );
    }

    // 验证URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // 检查域名是否在白名单中
    const domain = parsedUrl.hostname;
    const isAllowed = ALLOWED_DOMAINS.some(
      allowedDomain =>
        domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
    );

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Domain not allowed' },
        { status: 403 }
      );
    }

    // 添加超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    try {
      // 获取图片
      const response = await fetch(imageUrl, {
        headers: {
          // 添加一些常见的请求头，以避免被某些服务器拒绝
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          Referer: url.origin,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `Failed to fetch image: ${response.status} ${response.statusText}`,
          },
          { status: response.status }
        );
      }

      // 获取内容类型
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      // 检查是否是图片
      if (!contentType.startsWith('image/')) {
        return NextResponse.json(
          { error: 'URL does not point to an image' },
          { status: 400 }
        );
      }

      // 获取图片数据
      const imageData = await response.arrayBuffer();

      // 返回图片，并设置缓存头
      return new NextResponse(imageData, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': `public, max-age=${CACHE_TIME}`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
