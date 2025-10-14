import React from 'react';
import classes from './Skeleton.module.css';

// Predefined skeleton structures
const skeletonStructures = {
  // Text skeletons
  'text-single': { component: 'text', lines: 1, width: '100%', height: '20px' },
  'text-double': { component: 'text', lines: 2, width: '100%', height: '20px' },
  'text-triple': { component: 'text', lines: 3, width: '100%', height: '20px' },
  'text-paragraph': { component: 'text', lines: 4, width: '100%', height: '16px' },
  
  // Card skeletons
  'card-product': { component: 'card', width: '100%' },
  'card-profile': { component: 'card', width: '300px' },
  'card-news': { component: 'card', width: '100%' },
  
  // List skeletons
  'list-simple': { component: 'list', rows: 3 },
  'list-detailed': { component: 'list', rows: 5 },
  'list-navigation': { component: 'list', rows: 6 },
  
  // Grid skeletons
  'grid-2x2': { component: 'grid', columns: 2 },
  'grid-3x3': { component: 'grid', columns: 3 },
  'grid-4x4': { component: 'grid', columns: 4 },
  'grid-products': { component: 'grid', columns: 4 },
  
  // Image skeletons
  'image-square': { component: 'image', width: '200px', height: '200px' },
  'image-rectangle': { component: 'image', width: '300px', height: '200px' },
  'image-avatar': { component: 'image', width: '60px', height: '60px', rounded: true },
  'image-banner': { component: 'image', width: '100%', height: '300px' },
  
  // Table skeletons
  'table-simple': { component: 'table', columns: 3, rows: 4 },
  'table-detailed': { component: 'table', columns: 5, rows: 6 },
  
  // Special skeletons
  'marketplace-item': { 
    component: 'custom',
    children: [
      { width: '100%', height: '200px', type: 'image' },
      { width: '100%', height: '20px', margin: '8px 0' },
      { width: '80%', height: '16px', margin: '4px 0' },
      { width: '60%', height: '16px' }
    ]
  },
  'navbar': {
    component: 'custom',
    children: [
      { width: '120px', height: '40px' },
      { width: '200px', height: '20px', margin: '0 20px' },
      { width: '80px', height: '20px', margin: '0 20px' },
      { width: '60px', height: '20px' }
    ]
  },
  'sidebar': {
    component: 'list',
    rows: 8
  }
};

const Skeleton = ({ 
  name,
  component = 'text', 
  width = '100%', 
  height = '20px', 
  lines = 1,
  rows = 3,
  columns = 4,
  rounded = true,
  className = '',
  children,
  ...props 
}) => {
  // Get skeleton configuration from predefined structures if name is provided
  const skeletonConfig = name ? skeletonStructures[name] : null;
  const finalConfig = skeletonConfig ? { 
    component, 
    width, 
    height, 
    lines, 
    rows, 
    columns, 
    rounded, 
    className, 
    children,
    ...skeletonConfig,
    ...props 
  } : { component, width, height, lines, rows, columns, rounded, className, children, ...props };

  const getSkeletonClasses = () => {
    const baseClasses = [classes.skeleton];
    if (finalConfig.rounded) baseClasses.push(classes.rounded);
    if (finalConfig.className) baseClasses.push(finalConfig.className);
    return baseClasses.join(' ');
  };

  const getSkeletonStyle = () => ({
    width: finalConfig.width,
    height: finalConfig.height,
    ...finalConfig.style
  });

  const renderTextSkeleton = () => (
    <div className={classes.textSkeleton}>
      {Array.from({ length: finalConfig.lines }).map((_, index) => (
        <div
          key={index}
          className={getSkeletonClasses()}
          style={{
            ...getSkeletonStyle(),
            marginBottom: index < finalConfig.lines - 1 ? '8px' : '0',
            width: index === finalConfig.lines - 1 && finalConfig.lines > 1 ? '75%' : finalConfig.width
          }}
        />
      ))}
    </div>
  );

  const renderCardSkeleton = () => (
    <div className={classes.cardSkeleton}>
      <div
        className={getSkeletonClasses()}
        style={{
          width: '100%',
          height: '200px',
          marginBottom: '12px'
        }}
      />
      <div className={classes.cardContent}>
        <div
          className={getSkeletonClasses()}
          style={{
            width: '80%',
            height: '20px',
            marginBottom: '8px'
          }}
        />
        <div
          className={getSkeletonClasses()}
          style={{
            width: '60%',
            height: '16px',
            marginBottom: '8px'
          }}
        />
        <div
          className={getSkeletonClasses()}
          style={{
            width: '40%',
            height: '16px'
          }}
        />
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className={classes.listSkeleton}>
      {Array.from({ length: finalConfig.rows }).map((_, index) => (
        <div key={index} className={classes.listItem}>
          <div
            className={getSkeletonClasses()}
            style={{
              width: '40px',
              height: '40px',
              marginRight: '12px'
            }}
          />
          <div className={classes.listContent}>
            <div
              className={getSkeletonClasses()}
              style={{
                width: '70%',
                height: '16px',
                marginBottom: '4px'
              }}
            />
            <div
              className={getSkeletonClasses()}
              style={{
                width: '50%',
                height: '14px'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridSkeleton = () => (
    <div className={classes.gridSkeleton} style={{ display: 'grid', gridTemplateColumns: `repeat(${finalConfig.columns}, 1fr)`, gap: '16px' }}>
      {Array.from({ length: finalConfig.columns * 2 }).map((_, index) => (
        <div key={index} className={classes.gridItem}>
          <div
            className={getSkeletonClasses()}
            style={{
              width: '100%',
              height: '150px',
              marginBottom: '8px'
            }}
          />
          <div
            className={getSkeletonClasses()}
            style={{
              width: '80%',
              height: '16px',
              marginBottom: '4px'
            }}
          />
          <div
            className={getSkeletonClasses()}
            style={{
              width: '60%',
              height: '14px'
            }}
          />
        </div>
      ))}
    </div>
  );

  const renderImageSkeleton = () => (
    <div
      className={getSkeletonClasses()}
      style={getSkeletonStyle()}
    />
  );

  const renderTableSkeleton = () => (
    <div className={classes.tableSkeleton}>
      <div className={classes.tableHeader}>
        {Array.from({ length: finalConfig.columns }).map((_, index) => (
          <div
            key={index}
            className={getSkeletonClasses()}
            style={{
              width: '100px',
              height: '20px'
            }}
          />
        ))}
      </div>
      {Array.from({ length: finalConfig.rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={classes.tableRow}>
          {Array.from({ length: finalConfig.columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={getSkeletonClasses()}
              style={{
                width: '80px',
                height: '16px'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );

  const renderCustomSkeleton = () => {
    // Handle predefined custom skeletons with children array
    if (skeletonConfig && skeletonConfig.children) {
      return (
        <div className={classes.customSkeleton}>
          {skeletonConfig.children.map((child, index) => (
            <div
              key={index}
              className={getSkeletonClasses()}
              style={{
                width: child.width || '100%',
                height: child.height || '20px',
                margin: child.margin || '0',
                borderRadius: child.type === 'image' ? '8px' : '4px'
              }}
            />
          ))}
        </div>
      );
    }
    
    // Handle regular children prop
    if (children) {
      return (
        <div className={classes.customSkeleton}>
          {React.Children.map(children, (child, index) => (
            <div key={index} className={getSkeletonClasses()} style={getSkeletonStyle()}>
              {child}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div
        className={getSkeletonClasses()}
        style={getSkeletonStyle()}
      />
    );
  };

  const renderSkeleton = () => {
    switch (finalConfig.component) {
      case 'text':
        return renderTextSkeleton();
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'grid':
        return renderGridSkeleton();
      case 'image':
        return renderImageSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'custom':
        return renderCustomSkeleton();
      default:
        return renderTextSkeleton();
    }
  };

  return renderSkeleton();
};

export default Skeleton;
