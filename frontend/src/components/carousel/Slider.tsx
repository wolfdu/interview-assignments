import React, { useEffect, useMemo, useRef } from 'react';
import useRect from '../hooks/useRect';
import useSlider from '../hooks/useSlider';
import SliderDots from './SliderDots';
import SliderItem from './SliderItem';

interface SliderProps {
  className?: string;
  onSlideChange?: () => {};
  duration?: number;
  autoplay?: boolean;
  loop?: boolean;
  showIndicators?: boolean;
  children: React.ReactNode;
}

const Slider: React.FC<SliderProps> = (props) => {
  const { autoplay = true, duration = 3000, className } = props;
  let timer = useRef<NodeJS.Timeout | null>(null);
  const count = useMemo(() => React.Children.count(props.children), [props.children]);
  const { size, root } = useRect<HTMLDivElement>([count]);
  const itemSize = useMemo(() => size.width, [size]);
  const itemStyle = { width: itemSize };
  const wrapStyle = { width: itemSize * count };

  const { curIndex, sliderRef, moveSlider, setRefs, slideToTargeIndex } = useSlider({
    autoplay,
    count,
    size: itemSize,
    duration,
  });

  // slider启动事件
  const onStart = () => {
    // 如果slideritem 小于2个 或者没有开启自动滑动 不启动
    if (count < 2 || !autoplay) {
      return;
    }
    timer.current = setTimeout(() => {
      moveSlider();
    }, duration);
  };

  const cleanupTimer = () => {
    timer.current && clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    if (itemSize) {
      onStart();
    }
    return () => {
      cleanupTimer();
    };
  });

  const handleDotsClick = (index: number) => {
    slideToTargeIndex(index);
  };

  return (
    <div ref={root} className={`slider ${className}`}>
      <div ref={sliderRef} style={wrapStyle} className='slider__contain'>
        {React.Children.map(props.children, (child, index) => {
          if (!React.isValidElement(child)) return null;
          return (
            <SliderItem ref={setRefs(index)} style={itemStyle}>
              {child}
            </SliderItem>
          );
        })}
      </div>

      {count > 1 && (
        <SliderDots
          dotsTheme='light'
          items={props.children}
          currentIndex={curIndex}
          onDotClick={handleDotsClick}
          duration={duration}
        />
      )}
    </div>
  );
};

export default Slider;
