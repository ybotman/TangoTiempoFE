import styles from '@/styles/About.module.css';
console.log("Loaded component: AboutPage", __filename);

export const metadata = {
    title: 'About Us',
    description: 'Learn more about our company',
    openGraph: {
        title: 'About Us',
        description: 'Learn more about our company',
        url: 'http://localhost:3000/about',
    },
};

export default function About() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>About Us</h1>
            <p className={styles.paragraph}>
                Welcome to our website! We are a passionate team dedicated to providing the best service in the industry. Our mission is to offer top-notch solutions that meet your needs and exceed your expectations.
            </p>
            <p className={styles.paragraph}>
                Founded in 2024, our company has grown rapidly thanks to our commitment to quality and customer satisfaction. Our team is made up of experts in various fields, all working together to ensure that you get the best experience possible.
            </p>
            <p className={styles.paragraph}>
                Thank you for visiting our site. If you have any questions or need more information, feel free to <a className={styles.link} href="/contact">contact us</a>.
            </p>
        </main>
    );
}