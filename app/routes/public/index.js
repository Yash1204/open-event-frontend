import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import moment from 'moment';
import { set } from '@ember/object';
import ENV from 'open-event-frontend/config/environment';

@classic
export default class IndexRoute extends Route {
  @service
  headData;

  async model() {
    const eventDetails = this.modelFor('public');
    return {
      event   : eventDetails,
      tickets : await eventDetails.query('tickets', {
        reload: true,

        filter: [
          {
            and: [
              {
                name : 'sales-starts-at',
                op   : 'le',
                val  : moment().toISOString()
              },
              {
                name : 'sales-ends-at',
                op   : 'ge',
                val  : moment().toISOString()
              }
            ]
          }
        ]
      }),
      featuredSpeakers: await eventDetails.query('speakers', {
        filter: [
          {
            name : 'is-featured',
            op   : 'eq',
            val  : 'true'
          }
        ],
        'page[size]': 0
      }),

      sponsors : await eventDetails.get('sponsors'),
      tax      : await eventDetails.get('tax'),
      order    : this.store.createRecord('order', {
        event   : eventDetails,
        user    : this.authManager.currentUser,
        tickets : []
      }),

      attendees: [],

      mapConfig: ENV.APP.mapConfig
    };
  }

  afterModel(model) {
    set(this, 'headData.description', model.event.description);
  }

  resetController(controller) {
    super.resetController(...arguments);
    const model = controller.model.order;
    if (!model.id) {
      model.unloadRecord();
    }
  }
}
