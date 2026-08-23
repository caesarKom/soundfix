interface AvatarProps {
  name: string;
  imgUrl?: string | null;
  size?: number; // px
}

export function Avatar({ name, imgUrl, size = 40 }: AvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() || '?';

  const style = { width: size, height: size, fontSize: size * 0.45 };

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={initial}
        style={style}
        className="rounded-full object-cover bg-slate-800"
        onError={(e) => {
          // hide image if it doesn't load, show fallback
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  return (
    <div
      style={style}
      className="flex items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-bold select-none"
    >
      {initial}
    </div>
  );
}