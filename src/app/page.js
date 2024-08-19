import { redirect } from 'next/navigation';


export default function Home() {
    redirect('/calendar'); // If you have a redirect
    return null;
}
