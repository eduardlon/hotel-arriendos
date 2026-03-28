import React from 'react';

type MotionValue<T> = {
  get: () => T;
  set: (value: T) => void;
  onChange: (callback: (value: T) => void) => () => void;
};

const isMotionValue = (value: any): value is MotionValue<any> =>
  value && typeof value.get === 'function' && typeof value.onChange === 'function';

const createMotionValue = <T,>(initial: T): MotionValue<T> => {
  let current = initial;
  const listeners = new Set<(value: T) => void>();

  return {
    get: () => current,
    set: (value: T) => {
      current = value;
      listeners.forEach((listener) => listener(value));
    },
    onChange: (callback: (value: T) => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
};

const motionPropKeys = new Set([
  'animate',
  'initial',
  'exit',
  'transition',
  'variants',
  'layout',
  'layoutId',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
  'dragPropagation',
  'onAnimationStart',
  'onAnimationComplete',
  'onUpdate',
  'onDragStart',
  'onDrag',
  'onDragEnd',
  'onHoverStart',
  'onHoverEnd',
  'onPan',
  'onPanStart',
  'onPanEnd',
  'onTap',
  'onTapStart',
  'onTapCancel',
  'onTapEnd',
]);

const stripMotionProps = (props: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(props).filter(([key]) => !motionPropKeys.has(key) && !key.startsWith('while'))
  );

const createMotionComponent = (tag: string) => {
  const MotionComponent = ({ children, ...props }: any) => {
    const [resolved, setResolved] = React.useState(() =>
      isMotionValue(children) ? children.get() : children
    );

    React.useEffect(() => {
      if (!isMotionValue(children)) {
        return undefined;
      }

      setResolved(children.get());
      return children.onChange((value: any) => setResolved(value));
    }, [children]);

    const Tag: any = tag;
    const cleanedProps = stripMotionProps(props);
    return <Tag {...cleanedProps}>{isMotionValue(children) ? resolved : children}</Tag>;
  };

  MotionComponent.displayName = `motion.${tag}`;
  return MotionComponent;
};

const motion = new Proxy(
  {},
  {
    get: (_target, prop) => createMotionComponent(String(prop)),
  }
);

export const createFramerMotionMock = () => ({
  motion,
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useMotionValue: <T,>(initial: T) => createMotionValue(initial),
  useTransform: (value: any, transformer: any, output?: any) => {
    const base = isMotionValue(value) ? value : createMotionValue(value);

    if (typeof transformer === 'function') {
      const derived = createMotionValue(transformer(base.get()));
      base.onChange((next: any) => derived.set(transformer(next)));
      return derived;
    }

    if (Array.isArray(output)) {
      const derived = createMotionValue(output[0]);
      return derived;
    }

    return base;
  },
  animate: (value: any, target: any) => {
    if (value && typeof value.set === 'function') {
      value.set(target);
    }
    return { stop: () => {} };
  },
});
