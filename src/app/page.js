import { redirect } from 'next/navigation';

export default function Home() {
    console.log('deployed!!')
    redirect('/calendar');

    return null;
}
