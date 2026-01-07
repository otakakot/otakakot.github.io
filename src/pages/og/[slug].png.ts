import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { SITE_TITLE } from '../../consts';
import { readFile } from 'node:fs/promises';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { slug: post.id },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { slug } = props as { slug: string };
  
  const post = await getEntry('blog', slug);
  
  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  const { title } = post.data;

  const fontData = await readFile('./public/fonts/atkinson-regular.woff');

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          backgroundImage: 'linear-gradient(to bottom right, #e0e7ff, #cffafe)',
          padding: '80px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '24px',
                padding: '60px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 64,
                      fontWeight: 'bold',
                      color: '#1e293b',
                      textAlign: 'center',
                      marginBottom: '30px',
                      lineHeight: 1.2,
                    },
                    children: title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 32,
                      color: '#64748b',
                      textAlign: 'center',
                    },
                    children: SITE_TITLE,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Atkinson',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
