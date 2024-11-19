interface AppTitleProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

export const AppTitle = ({
  title: titleProp,
  subtitle: subtitleProp,
}: AppTitleProps) => {
  const title = titleProp || "Vouch Portal";
  const subtitle = subtitleProp || "Your Passport to the Permaweb";

  return (
    <div className="text-center">
      <h1 className="text-5xl md:text-6xl font-bold tracking-wide">{title}</h1>
      <h2 className="text-lg md:text-xl tracking-wider md:tracking-widest text-muted-foreground">
        {subtitle}
      </h2>
    </div>
  );
};
