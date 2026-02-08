import { FC } from 'react';
import { widgetManifest } from '../widgets/manifest';

const WidgetDisplay: FC = () => {
  return (
    <div>
      <h2>Your Dashboard</h2>
      <div>
        {widgetManifest.map(widget => {
          const WidgetComponent = widget.component;
          return <WidgetComponent key={widget.id} />;
        })}
      </div>
    </div>
  );
};

export default WidgetDisplay;
