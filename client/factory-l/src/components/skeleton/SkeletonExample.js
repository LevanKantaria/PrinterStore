import React from 'react';
import Skeleton from './Skeleton';
import classes from './Skeleton.module.css';

const SkeletonExample = () => {
  return (
    <div className={classes.exampleContainer}>
      <h2>Skeleton Component Examples</h2>
      
      {/* Predefined Skeleton Names */}
      <div className={classes.exampleSection}>
        <h3>Predefined Skeleton Names</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4>Text Skeletons</h4>
            <Skeleton name="text-single" />
            <br />
            <Skeleton name="text-double" />
            <br />
            <Skeleton name="text-paragraph" />
          </div>
          <div>
            <h4>Card Skeletons</h4>
            <Skeleton name="card-product" />
          </div>
          <div>
            <h4>Image Skeletons</h4>
            <Skeleton name="image-avatar" />
            <br />
            <Skeleton name="image-rectangle" />
          </div>
        </div>
      </div>

      {/* Marketplace Item Skeleton */}
      <div className={classes.exampleSection}>
        <h3>Marketplace Item Skeleton</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <Skeleton name="marketplace-item" />
          <Skeleton name="marketplace-item" />
          <Skeleton name="marketplace-item" />
        </div>
      </div>

      {/* Grid Skeletons */}
      <div className={classes.exampleSection}>
        <h3>Grid Skeletons</h3>
        <div>
          <h4>2x2 Grid</h4>
          <Skeleton name="grid-2x2" />
        </div>
        <br />
        <div>
          <h4>4x4 Grid (Products)</h4>
          <Skeleton name="grid-products" />
        </div>
      </div>

      {/* List Skeletons */}
      <div className={classes.exampleSection}>
        <h3>List Skeletons</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <h4>Simple List</h4>
            <Skeleton name="list-simple" />
          </div>
          <div>
            <h4>Navigation List</h4>
            <Skeleton name="list-navigation" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className={classes.exampleSection}>
        <h3>Table Skeleton</h3>
        <Skeleton name="table-detailed" />
      </div>

      {/* Navbar Skeleton */}
      <div className={classes.exampleSection}>
        <h3>Navbar Skeleton</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <Skeleton name="navbar" />
        </div>
      </div>

      {/* Traditional Usage (still supported) */}
      <div className={classes.exampleSection}>
        <h3>Traditional Usage (still supported)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <Skeleton component="card" />
          <Skeleton component="image" width="300px" height="200px" />
          <Skeleton component="text" lines={3} />
        </div>
      </div>

      {/* Animation Comparison */}
      <div className={classes.exampleSection}>
        <h3>Animation Types</h3>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <div>
            <p>Shimmer (default)</p>
            <Skeleton name="image-square" />
          </div>
          <div>
            <p>Pulse</p>
            <Skeleton name="image-square" className={classes.pulse} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonExample;