import { useCustomCursor } from '@/hooks/useCustomCursor';

interface Props {
  isHeroVisible: boolean;
}

export default function CustomCursor({ isHeroVisible }: Props) {
  const { dotRef, ringRef } = useCustomCursor(isHeroVisible);

  return (
    <div className="cursor" id="cursor" aria-hidden="true">
      <div className="cursor-ring" id="cursorRing" ref={ringRef} />
      <div className="cursor-dot" id="cursorDot" ref={dotRef} />
    </div>
  );
}
