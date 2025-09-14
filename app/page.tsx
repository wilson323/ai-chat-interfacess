import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/user/chat');
  return null;
}
