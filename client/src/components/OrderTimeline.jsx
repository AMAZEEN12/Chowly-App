const orderSteps = ['Assigned', 'Preparing', 'Ready', 'Served', 'Paid'];
export default function OrderTimeline({ status }) {
  const specialDelayed = status === 'Delayed';
  const index = status === 'Scheduled' || status === 'Submitted' ? 0 : Math.max(0, orderSteps.indexOf(status));
  return (
    <div className="timeline">
      {orderSteps.map((step, i) => (
        <div className={`timeline-step ${i <= index ? 'active' : ''}`} key={step}>
          <div className="dot" />
          <span>{step}</span>
        </div>
      ))}
      {specialDelayed && <div className="delay-banner">This order has exceeded its estimated waiting time.</div>}
    </div>
  );
}
