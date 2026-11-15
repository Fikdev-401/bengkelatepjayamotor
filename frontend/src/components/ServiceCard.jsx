import { rupiah } from '../lib/format';
import Icon from './Icon';

export default function ServiceCard({ service, onBook }) {
  return (
    <article className="service-card">
      {service.isFeatured && <span className="service-card__flag">Favorit</span>}

      <div className="service-card__top">
        <span className="service-card__icon">
          <Icon name={service.icon} size={24} />
        </span>
        <span className="chip">{service.category}</span>
      </div>

      <h3>{service.name}</h3>
      <p className="service-card__desc">{service.description}</p>

      <div className="service-card__foot">
        <div className="service-card__price">
          <span>Mulai dari</span>
          <strong>{rupiah(service.price)}</strong>
          {service.duration && (
            <span className="service-card__duration">
              <Icon name="clock" size={14} />
              {service.duration}
            </span>
          )}
        </div>

        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => onBook(service)}
        >
          Booking
          <Icon name="arrow-right" size={15} />
        </button>
      </div>
    </article>
  );
}
