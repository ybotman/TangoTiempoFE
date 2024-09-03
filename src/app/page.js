import { redirect } from 'next/navigation';

export default function Home() {
    redirect('/calendar');

    return null;
}
