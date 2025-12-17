// prettier-ignore
const styles = {
  container: 'under-development-container flex min-h-screen flex-col items-center justify-center bg-accent px-4 py-8',
  content: 'under-development-content flex flex-col items-center justify-center gap-4 text-center',
  title: 'under-development-title text-primary text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.2] tracking-[-1.5px] transition-all duration-200 ease-out',
  message: 'under-development-message text-secondary text-lg md:text-xl lg:text-2xl leading-[1.5] tracking-[-0.3px] max-w-2xl transition-all duration-200 ease-out'
} satisfies Record<string, string>;

export const UnderDevelopment = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>🧑‍💻 under development</h1>
        <p className={styles.message}>
          still building, fren
          <br />
          see you on XMAS day 🎄
        </p>
      </div>
    </div>
  );
};

