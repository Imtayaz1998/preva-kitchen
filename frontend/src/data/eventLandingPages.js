/*
 * Content for the event landing pages (/corporate-events, /birthday-parties,
 * /baby-showers). Copy, packages and FAQs mirror the live prevaclub.com pilot
 * pages. No prices or capacities are published: the owner has not signed off
 * a rate sheet, and the capacity figures are not yet verified.
 */

export const EVENT_CONTACT = {
  address: '13090 Inkster Rd, Redford Township, MI 48239',
  phoneDisplay: '(313) 286-3586',
  phoneHref: 'tel:+13132863586',
  email: 'reservations@prevakitchen.com'
};

const IMG = '/asset/events';

// Section titles use "Main words |Accent words": the part after | renders in
// the Preva Kitchen gold italic accent.

export const EVENT_PAGES = {
  'corporate-events': {
    slug: 'corporate-events',
    useCase: 'corporate_event',
    eventType: 'Corporate Event / Holiday Party',
    breadcrumb: 'Corporate Events',
    seo: {
      title: 'Corporate Event Venue in Redford, MI',
      description: 'Corporate event venue in Redford, MI. Meetings and training days, holiday parties, and award dinners, with catering by Preva Kitchen and an events team.',
      image: `${IMG}/corporate-events-hero.jpeg`
    },
    hero: {
      eyebrow: 'Corporate Events & Holiday Parties · Redford, MI',
      title: 'Corporate Event Venue',
      titleAccent: 'in Redford, Michigan',
      sub: 'Bring the team together and make the room work for the moment. Meetings and training days, award dinners, client events, and holiday parties — with catering from Preva Kitchen and an events team on the day.',
      primaryCta: 'Check Your Date →',
      secondaryCta: 'Explore Corporate Options',
      image: `${IMG}/corporate-events-hero.jpeg`,
      imageAlt: 'Corporate event and holiday party venue at PREVA in Redford, Michigan',
      badge: [['Formats', 'Meetings & Celebrations'], ['Location', '13090 Inkster Rd']]
    },
    lead: {
      title: 'Plan a Corporate Event |at PREVA',
      text: 'Send the details and the events team will come back with availability, room options, and a quote for your format. Tell us what your finance team needs and we will confirm the billing route at the same time.'
    },
    form: {
      submitLabel: 'Submit Corporate Event Inquiry →',
      note: 'Goes straight to the PREVA events team. Availability and final terms are confirmed by the team.',
      nameLabel: 'Full Name *',
      namePlaceholder: 'Your name',
      emailLabel: 'Work Email *',
      emailPlaceholder: 'name@company.com',
      phoneLabel: 'Phone *',
      phonePlaceholder: '(313) 555-0100',
      guestLabel: 'Number of Attendees *',
      guestPlaceholder: '60',
      company: true,
      consent: true,
      eventTypeSelect: {
        name: 'eventFormat',
        label: 'Event Type',
        options: [
          ['', 'Not sure yet — happy to discuss'],
          ['meeting', 'Meeting or training day'],
          ['presentation', 'Presentation or award dinner'],
          ['holiday_party', 'Holiday party'],
          ['client_event', 'Client or networking event'],
          ['team_social', 'Team social']
        ]
      },
      extraSelect: {
        name: 'avNeeds',
        label: 'Presentation Needs',
        half: true,
        options: [
          ['', 'Not sure yet — happy to discuss'],
          ['none', 'None — social event only'],
          ['screen', 'Screen for slides'],
          ['screen_mic', 'Screen and microphone'],
          ['full', 'Screen, microphone and speakers']
        ]
      },
      messageLabel: 'Tell Us About the Event',
      messagePlaceholder: 'Agenda and running order, start and end times, catering, seating preference, and anything your finance team needs on the invoice.'
    },
    specs: [
      ['Meetings', 'Flexible Room Setups'],
      ['Dining', 'Preva Kitchen Options'],
      ['Celebrations', 'Holiday & Team Events'],
      ['Weekdays', 'Daytime Slots Available']
    ],
    packages: {
      eyebrow: 'Corporate Options',
      title: 'Pick the Shape |of the Event',
      text: 'Pricing is built around your date, session length, room, seating, catering, beverage service, and presentation needs. Ask the events team for a quote on your specific agenda.',
      items: [
        {
          title: 'Meeting & Training Day',
          sub: 'Half or full day, working format',
          points: ['Boardroom, classroom, or theater seating', 'Screen, microphone, and Wi-Fi needs reviewed per booking', 'Coffee service, catered breaks, and working lunch', 'Weekday and daytime slots', 'One events contact from inquiry to invoice'],
          cta: 'Plan a Working Day →'
        },
        {
          title: 'Holiday Party',
          sub: 'Dinner, drinks, music and dancing',
          featured: true,
          points: ['Private area with a dance floor', 'Plated dinner, buffet, or reception service', 'Space for a short speech or team awards', 'Bar service arranged with the events team', 'December dates are the first to go — ask early'],
          cta: 'Plan the Holiday Party →'
        },
        {
          title: 'Client & Award Event',
          sub: 'Program first, networking second',
          points: ['Speaker-facing or theater setup', 'Screen, microphone, and staging reviewed in advance', 'Seated dinner or reception-style service', 'Layout planned for mingling after the program', 'Dedicated event coordination'],
          cta: 'Talk Through the Plan →'
        }
      ]
    },
    spaces: {
      eyebrow: 'The Spaces',
      title: 'Three Ways to |Use the Venue',
      text: 'Each area suits a different part of the day. Most corporate bookings use two of them.',
      items: [
        { title: 'Meeting & Presentation Area', text: 'For the working half of the day: sessions, training, presentations, and award programs, seated to the format you confirm.', image: `${IMG}/meeting-presentation-area.jpeg`, alt: 'Meeting and presentation seating at PREVA' },
        { title: 'Dining & Celebration Area', text: 'For the social half: dinner, drinks, music, and dancing, with room for a toast or a team award before the evening opens up.', image: `${IMG}/dining-celebration-area.jpeg`, alt: 'Dining and celebration setup for a company event at PREVA' },
        { title: 'Entrance & Outdoor Patio', text: 'A seasonal option for arrivals, breaks, and informal networking, when the weather and the venue schedule allow.', image: `${IMG}/entrance-and-patio.jpeg`, alt: 'Entrance and outdoor patio at PREVA, used for breaks and networking' }
      ]
    },
    process: {
      eyebrow: 'Booking',
      title: 'How It |Works',
      steps: [
        ['Send the Brief', 'Your preferred date, headcount, company, format, and any presentation or catering needs.'],
        ['Confirm Availability', 'The events team checks which area and time slots are open for your date and comes back with the options.'],
        ['Build the Schedule', 'Seating, equipment, catering and break timing, bar service, and the flow from program into the social half.'],
        ['Sign and Hold the Date', 'Once you approve the proposal, the agreement, deposit, and billing arrangements hold the date.']
      ]
    },
    faq: {
      eyebrow: 'Questions',
      title: 'Before You |Book',
      items: [
        ['What kinds of corporate events can PREVA host?', 'Meetings, training days, presentations, award dinners, client events, team gatherings, and holiday parties. The events team will recommend a setup based on your format, headcount, and agenda.'],
        ['Can one booking run a formal program and a social evening?', 'Yes, and most corporate bookings here do. The room is planned so the presentation, awards, or speeches happen first and the evening moves into dinner, music, and networking without relocating your group.'],
        ['Are weekday and daytime slots available?', 'Yes. Weekday and daytime bookings are usually the easiest dates to secure, since evenings and weekends carry more social events. The events team will confirm which dates are open for your booking.'],
        ['What presentation equipment is available?', 'Screen, microphone, speaker, and Wi-Fi requirements are reviewed and confirmed with the events team for each booking, so the room is ready before your session starts. Tell us what you need on the inquiry form.'],
        ['Can you invoice our company rather than take a card?', 'Billing arrangements, purchase order references, and the documents your finance team needs are confirmed with the events team before the booking is finalized. Tell us on the inquiry form what your company requires and we will confirm the route.'],
        ['Can PREVA cater a corporate event?', 'Preva Kitchen can provide coffee service, catered breaks, working lunch, plated dinner, buffet, and reception-style options. Licensed and insured outside caterers may be permitted, subject to venue approval and a current certificate of insurance.'],
        ['How do we reserve a corporate date?', 'Submit the inquiry with your preferred date, headcount, and format. The events team will confirm availability and provide the applicable proposal, agreement, and deposit terms before the booking is finalized.']
      ]
    },
    related: {
      text: 'Other formats our events team runs at 13090 Inkster Road.',
      items: ['birthday-parties', 'baby-showers']
    },
    finalCta: {
      eyebrow: 'Want to See the Space?',
      title: 'Tour PREVA Before You |Finalize the Company Event',
      text: 'Share your preferred date and tell the events team you would like to schedule a venue walkthrough.'
    }
  },

  'birthday-parties': {
    slug: 'birthday-parties',
    useCase: 'birthday_party',
    eventType: 'Birthday Party',
    breadcrumb: 'Birthday Parties',
    seo: {
      title: 'Birthday Party Venue in Redford, MI',
      description: 'Birthday party venue in Redford, MI. Reserved booths for small groups, private rooms for milestone birthdays, and catering by Preva Kitchen.',
      image: `${IMG}/birthday-party-hero.jpeg`
    },
    hero: {
      eyebrow: 'Birthday Parties · Redford, MI',
      title: 'Birthday Party Venue',
      titleAccent: 'in Redford, Michigan',
      sub: 'A reserved booth for a dozen friends, or a private room for a milestone birthday. Preva Kitchen handles the food, our team handles the rest.',
      primaryCta: 'Check Your Date →',
      secondaryCta: 'See Birthday Options',
      image: `${IMG}/birthday-party-hero.jpeg`,
      imageAlt: 'Birthday party venue at PREVA in Redford, Michigan',
      badge: [['Setup', 'Booths, Sections & Rooms'], ['Location', '13090 Inkster Rd']]
    },
    lead: {
      title: 'Plan a Birthday |at PREVA',
      text: 'Send your date and rough headcount. The events team will confirm what is open and recommend a booth, a section, or a private room depending on the size of the group.'
    },
    form: {
      submitLabel: 'Submit Birthday Inquiry →',
      note: 'Routed to the PREVA events team. Availability and final event terms are confirmed directly by the team.',
      nameLabel: 'Full Name *',
      namePlaceholder: 'Your Name',
      emailLabel: 'Email Address *',
      emailPlaceholder: 'name@example.com',
      phoneLabel: 'Phone Number *',
      phonePlaceholder: '(313) 000-0000',
      guestLabel: 'Estimated Guests *',
      guestPlaceholder: 'e.g. 40',
      eventTypeDisplay: 'Birthday Party',
      extraSelect: {
        name: 'underTwentyOne',
        label: 'Will Any Guests Be Under 21?',
        options: [
          ['all_21', 'No — all guests are 21 or over'],
          ['some_under', 'Yes — some guests under 21'],
          ['mostly_under', 'Yes — mostly under 21 (Sweet 16, teen birthday)'],
          ['', 'Not sure yet']
        ]
      },
      messageLabel: 'Tell Us About the Birthday',
      messagePlaceholder: 'Whose birthday, the kind of night you have in mind, food preferences, cake, DJ or decorations, and anything else we should know.'
    },
    specs: [
      ['Booths', 'Reserved For Your Group'],
      ['Private Rooms', 'For Milestone Birthdays'],
      ['Preva Kitchen', 'Platters To Full Buffet'],
      ['All Ages', 'Ask About Under-21 Bookings']
    ],
    packages: {
      eyebrow: 'Birthday Options',
      title: 'Choose the |Size of the Night',
      text: 'Rates depend on your date, the space you use, event duration, catering and beverage service.',
      items: [
        {
          title: 'Reserved Booth',
          sub: 'Small groups',
          points: ['Booth or section reserved for your group', 'Preva Kitchen shared platters', 'Bottle service available for guests 21 and over', 'Cake presentation handled by our team'],
          cta: 'Inquire About a Booth →'
        },
        {
          title: 'Milestone Birthday',
          sub: 'Dinner, music and dancing',
          featured: true,
          points: ['Private area with a dance floor', 'Buffet or heavy appetizer service', 'DJ, lighting and playlist coordinated', 'Space for speeches, photos and the cake'],
          cta: 'Plan a Milestone →'
        },
        {
          title: 'Private Birthday Event',
          sub: 'Larger, invitation-only celebrations',
          points: ['Private use of approved venue areas', 'Custom floor plan and event flow', 'Full food and beverage planning', 'Dedicated event coordination and security staffing'],
          cta: 'Ask About Private Use →'
        }
      ]
    },
    spaces: {
      eyebrow: 'See the Space',
      title: 'Three Ways to |Set Up a Birthday',
      items: [
        { title: 'Reserved Booths', text: 'Lounge seating that keeps a smaller group together, with service brought to the table.', image: `${IMG}/lounge-booths.jpeg`, alt: 'Reserved booth seating for a birthday group at PREVA' },
        { title: 'Dining & Dance Floor', text: 'A private area for dinner, speeches and the cake, with room to move once the music starts.', image: `${IMG}/dining-dance-floor.jpg`, alt: 'Private dining and dance floor set for a milestone birthday at PREVA' },
        { title: 'Outdoor Patio', text: 'A seasonal option for daytime birthdays and open-air gatherings when the weather allows.', image: `${IMG}/entrance-and-patio.jpeg`, alt: 'Outdoor patio birthday gathering at PREVA' }
      ]
    },
    process: {
      eyebrow: 'Simple & Clear',
      title: 'How Birthday |Booking Works',
      steps: [
        ['Send the Date', 'Tell us the date, roughly how many people, and whether any guests will be under 21.'],
        ['Confirm Availability', 'The events team confirms which spaces and times are open for that date.'],
        ['Build the Night', 'Confirm the space, food, beverage service, music and any decorations or cake plans.'],
        ['Reserve the Date', 'Once the proposal and terms are approved, the agreement and deposit finalize the booking.']
      ]
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Birthday Party |Questions',
      items: [
        ['How small a birthday group can PREVA host?', 'Groups of roughly ten upward can be seated in a reserved booth or section. Larger milestone birthdays move into a dedicated room or a private area of the venue. The events team will recommend the setup once they know your date and headcount.'],
        ['Can guests under 21 attend a birthday party?', 'It depends on the booking. Private daytime and early-evening bookings are often arranged for all ages, while later club hours are restricted. Tell us on the inquiry form whether guests under 21 are attending and the events team will confirm what is possible for your date. Michigan law requires valid ID for anyone served alcohol, with no exceptions.'],
        ['Can we bring a cake, decorations, or a DJ?', 'Yes. Outside cakes are welcome, and decorators, DJs and photographers can be arranged, subject to licensing and venue approval. Share the plan with the events team so setup and load-in times can be scheduled.'],
        ['Do you cater birthday parties?', 'Preva Kitchen provides catering for birthdays, from shared platters for a booth to a full buffet for a milestone celebration. Menus are confirmed with the events team for each booking.'],
        ['Is bottle service available for a birthday booking?', 'Bottle service is available for private birthday bookings in reserved booths and sections. All alcohol service is limited to verified guests aged 21 and over, and the arrangement is confirmed with the events team before the booking is finalized.'],
        ['Is there parking at the venue?', 'There is parking on site at 13090 Inkster Rd. Arrangements for larger guest counts, and for parents dropping off and collecting younger guests, are confirmed with the events team when the booking is planned.'],
        ['How do we reserve a birthday date?', 'Submit the inquiry with your preferred date and estimated guest count. The events team will confirm availability and provide the applicable proposal, agreement, and deposit terms before the booking is finalized.']
      ]
    },
    related: {
      text: 'Other celebrations our events team runs at 13090 Inkster Road.',
      items: ['baby-showers', 'corporate-events']
    },
    finalCta: {
      eyebrow: 'Still Deciding?',
      title: 'See the Space |Before You Book',
      text: 'A short walkthrough answers more than any page can. Send your date and the events team will arrange a visit.'
    }
  },

  'baby-showers': {
    slug: 'baby-showers',
    useCase: 'baby_shower',
    eventType: 'Baby / Bridal Shower',
    breadcrumb: 'Baby & Bridal Showers',
    seo: {
      title: 'Baby Shower Venue in Redford, MI',
      description: 'Baby and bridal shower venue in Redford, MI. Daytime private rooms, brunch by Preva Kitchen, space for games and gifts, and your decorator welcome.',
      image: `${IMG}/baby-shower-hero.jpeg`
    },
    hero: {
      eyebrow: 'Baby & Bridal Showers · Redford, MI',
      title: 'Baby Shower Venue',
      titleAccent: 'in Redford, Michigan',
      sub: 'A bright private room for the afternoon, brunch from Preva Kitchen, and space for games, gifts and photographs. Bring your own decorator.',
      primaryCta: 'Check Your Date →',
      secondaryCta: 'See Shower Options',
      image: `${IMG}/baby-shower-hero.jpeg`,
      imageAlt: 'Baby shower venue at PREVA in Redford, Michigan',
      imageFit: 'contain',
      badge: [['Setup', 'Daytime Private Room'], ['Location', '13090 Inkster Rd']]
    },
    lead: {
      title: 'Plan a Shower |at PREVA',
      text: 'Send your date and rough guest count. The events team will confirm what is open, and walk you through the room layout, the menu, and the setup window for your decorator.'
    },
    form: {
      submitLabel: 'Submit Shower Inquiry →',
      note: 'Routed to the PREVA events team. Availability and final event terms are confirmed directly by the team.',
      nameLabel: 'Full Name *',
      namePlaceholder: 'Your Name',
      emailLabel: 'Email Address *',
      emailPlaceholder: 'name@example.com',
      phoneLabel: 'Phone Number *',
      phonePlaceholder: '(313) 000-0000',
      guestLabel: 'Estimated Guests *',
      guestPlaceholder: 'e.g. 45',
      eventTypeDisplay: 'Baby / Bridal Shower',
      extraSelect: {
        name: 'showerType',
        label: 'What Kind of Shower?',
        options: [
          ['baby', 'Baby shower'],
          ['bridal', 'Bridal shower'],
          ['sip_and_see', 'Sip and see'],
          ['gender_reveal', 'Gender reveal'],
          ['', 'Not sure yet — happy to discuss']
        ]
      },
      messageLabel: 'Tell Us About the Shower',
      messagePlaceholder: 'Time of day, brunch or lunch, dessert table, decorator or backdrop plans, games, dietary requirements, and anything else we should know.'
    },
    specs: [
      ['Daytime', 'Weekend Slots Available'],
      ['Private Room', 'Just Your Guests'],
      ['Brunch Menus', 'By Preva Kitchen'],
      ['Setup Window', 'Before Doors Open']
    ],
    packages: {
      eyebrow: 'Shower Options',
      title: 'Choose How the |Afternoon Runs',
      text: 'Rates depend on your date, the room you use, event duration and the catering style you choose.',
      items: [
        {
          title: 'Intimate Shower',
          sub: 'Close family and friends',
          points: ['Private seating area for your group', 'Brunch service or shared platters', 'Gift and dessert table space', 'Events team coordination'],
          cta: 'Inquire About This Option →'
        },
        {
          title: 'Full Shower Celebration',
          sub: 'Brunch, games and gift opening',
          featured: true,
          points: ['Private room with the floor planned around games', 'Brunch or plated lunch service', 'Setup window for your decorator and backdrop', 'Dessert table, gift table and photo corner'],
          cta: 'Plan the Shower →'
        },
        {
          title: 'Bridal Shower',
          sub: 'Ahead of the wedding',
          points: ['Private room with a more formal table setting', 'Custom menu and beverage service', 'Space for speeches, gifts and photographs', 'Coordinated with your wedding plans if PREVA is hosting'],
          cta: 'Discuss a Bridal Shower →'
        }
      ]
    },
    spaces: {
      eyebrow: 'See the Space',
      title: 'Where the |Afternoon Happens',
      items: [
        { title: 'Private Dining Room', text: 'Seated tables with a clear center for games, gift opening and the cake or dessert moment.', image: `${IMG}/dining-celebration-area.jpeg`, alt: 'Private dining room set with tables for a shower at PREVA' },
        { title: 'Lounge Seating', text: 'A softer setting for a smaller group, with service brought to the table throughout the afternoon.', image: `${IMG}/lounge-social-areas.jpeg`, alt: 'Lounge seating for a bridal shower at PREVA' },
        { title: 'Outdoor Patio', text: 'A seasonal option for a daytime shower and open-air photographs when the weather allows.', image: `${IMG}/entrance-and-patio.jpeg`, alt: 'Outdoor patio at PREVA for a daytime shower' }
      ]
    },
    process: {
      eyebrow: 'Simple & Clear',
      title: 'How Shower |Booking Works',
      steps: [
        ['Send the Date', 'Tell us the date, the time of day, and roughly how many guests you expect.'],
        ['Confirm Availability', 'The events team confirms which room and time slot are open for that date.'],
        ['Plan the Afternoon', 'Confirm the layout, menu, dessert and gift tables, and the setup window for your decorator.'],
        ['Reserve the Date', 'Once the proposal and terms are approved, the agreement and deposit finalize the booking.']
      ]
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Shower |Questions',
      items: [
        ['Can PREVA host a daytime baby shower?', 'Yes. Daytime and early-afternoon bookings are among the easiest dates to secure, including weekends. The events team will confirm which room and time slot are open for your date.'],
        ['Can our decorator set up before guests arrive?', 'Yes. A setup window is scheduled before doors so your decorator can dress the room, arrange the backdrop, and set the dessert and gift tables. Outside vendors must be licensed and insured and are subject to venue approval.'],
        ['What food options work for a shower?', 'Preva Kitchen offers brunch service, plated lunch, and grazing or shared platter styles. Menus are built with the events team, and dietary requirements can be accommodated with advance notice.'],
        ['Is there room for games, a gift table, and a photo backdrop?', 'Yes. The floor plan is arranged around how the afternoon runs, with clear space for games, an accessible gift and dessert table, and a wall or corner for a photo backdrop.'],
        ['Do you host bridal showers, sip and sees and gender reveals?', 'Yes. We can host all four, and each is planned differently, so tell us which one you are holding on the inquiry form. The room dressing, the menu and the running order are built around that answer.'],
        ['Is there parking at the venue?', 'There is parking on site at 13090 Inkster Rd, close to the entrance. Arrangements for larger guest counts and for guests carrying gifts or arriving with young children are confirmed with the events team during the walkthrough.'],
        ['How do we reserve a shower date?', 'Submit the inquiry with your preferred date and estimated guest count. The events team will confirm availability and provide the applicable proposal, agreement, and deposit terms before the booking is finalized.']
      ]
    },
    related: {
      text: 'Other celebrations our events team runs at 13090 Inkster Road.',
      items: ['birthday-parties', 'corporate-events']
    },
    finalCta: {
      eyebrow: 'Still Deciding?',
      title: 'See the Room |Before You Book',
      text: 'A short walkthrough answers more than any page can. Send your date and the events team will arrange a visit.'
    }
  },
  weddings: {
    slug: 'weddings',
    useCase: 'wedding',
    eventType: 'Wedding Reception',
    breadcrumb: 'Weddings',
    seo: {
      title: 'Wedding Venue in Redford, MI',
      description: 'Wedding reception venue in Redford, MI. Flexible layouts for dinner, speeches and dancing, with catering by Preva Kitchen and a seasonal patio.',
      image: `${IMG}/dining-celebration-area.jpeg`
    },
    hero: {
      eyebrow: 'Wedding Receptions · Redford, MI',
      title: 'Wedding Venue',
      titleAccent: 'in Redford, Michigan',
      sub: 'Your people, your traditions, your celebration. Flexible layouts for dinner, speeches, music and dancing — with catering from Preva Kitchen and a team that plans the evening around your timeline.',
      primaryCta: 'Check Your Date →',
      secondaryCta: 'Explore Wedding Options',
      image: `${IMG}/dining-celebration-area.jpeg`,
      imageAlt: 'Wedding reception venue at PREVA in Redford, Michigan',
      badge: [['Setup', 'Flexible Reception Layouts'], ['Location', '13090 Inkster Rd']]
    },
    lead: {
      title: 'Plan Your Wedding |Reception at PREVA',
      text: 'Tell us what you are planning. The events team will review your preferred date, guest count, catering needs, and the type of reception you have in mind.'
    },
    form: {
      submitLabel: 'Submit Wedding Inquiry →',
      note: 'Routed to the PREVA events team. Availability and final event terms are confirmed directly by the team.',
      nameLabel: 'Full Name *',
      namePlaceholder: 'Your Name',
      emailLabel: 'Email Address *',
      emailPlaceholder: 'name@example.com',
      phoneLabel: 'Phone Number *',
      phonePlaceholder: '(313) 000-0000',
      guestLabel: 'Estimated Guests *',
      guestPlaceholder: 'e.g. 150',
      eventTypeSelect: {
        name: 'eventFormat',
        label: 'What Are You Planning?',
        options: [
          ['reception_only', 'Reception only — one day'],
          ['ceremony_reception', 'Ceremony and reception, same day'],
          ['', 'Not sure yet — happy to discuss']
        ]
      },
      extraSelect: {
        name: 'barArrangement',
        label: 'Bar Arrangement',
        half: true,
        options: [
          ['', 'Not sure yet — happy to discuss'],
          ['open_bar', 'Open bar'],
          ['beer_wine', 'Beer and wine only'],
          ['cash_bar', 'Cash bar'],
          ['alcohol_free', 'Alcohol-free reception']
        ]
      },
      messageLabel: 'Tell Us About Your Wedding',
      messagePlaceholder: 'Church or ceremony time, reception timeline, menu ideas, music, special moments, and anything else we should know.'
    },
    specs: [
      ['Reception', 'Flexible Event Layouts'],
      ['Preva Kitchen', 'Catering Options'],
      ['Patio', 'Seasonal Outdoor Option'],
      ['Bar Service', 'Open, Limited Or None']
    ],
    packages: {
      eyebrow: 'Wedding Options',
      title: 'Choose the |Reception Style',
      text: 'Wedding rates are built around your date, the spaces you use, event duration, catering, beverage service, setup, and production needs.',
      items: [
        {
          title: 'Intimate Wedding Reception',
          sub: 'Dinner, family, and close friends',
          points: ['Dining-focused reception layout', 'Preva Kitchen catering options', 'Space for speeches, photos, and cake moments', 'Flexible seating based on the confirmed event plan', 'Events team coordination'],
          cta: 'Inquire About an Intimate Reception →'
        },
        {
          title: 'Full Wedding Celebration',
          sub: 'Dinner, cocktails, music and dancing',
          featured: true,
          points: ['Flexible reception and social layout', 'Food and beverage planning', 'DJ, speeches, and special-moment requirements reviewed', 'Indoor event areas coordinated around your timeline', 'Optional patio use when available'],
          cta: 'Plan My Wedding Reception →'
        }
      ]
    },
    spaces: {
      eyebrow: 'See the Space',
      title: 'Three Ways to |Shape the Reception',
      text: 'Build the celebration around the guest experience, from dinner and speeches to mingling, photographs and dancing.',
      items: [
        { title: 'Dining & Reception Area', text: 'A flexible setting for dinner, speeches, cake cutting, family tables, and the main reception program.', image: `${IMG}/dining-celebration-area.jpeg`, alt: 'Wedding dining and reception setup at PREVA' },
        { title: 'Lounge & Social Areas', text: 'Lounge areas for cocktails, guest conversation, photo moments, or family gathering space around the reception.', image: `${IMG}/lounge-social-areas.jpeg`, alt: 'Wedding lounge and social areas at PREVA' },
        { title: 'Entrance & Outdoor Patio', text: 'A seasonal option for the arrival, cocktail hour and photographs when weather and venue scheduling allow.', image: `${IMG}/entrance-and-patio.jpeg`, alt: 'Entrance and outdoor patio option for a wedding reception at PREVA' }
      ]
    },
    process: {
      eyebrow: 'Simple & Clear',
      title: 'How Wedding |Booking Works',
      steps: [
        ['Share Your Wedding Plan', 'Send your preferred date, estimated guest count, reception style, and your church service time if the ceremony is off site.'],
        ['Confirm Availability', 'The events team will confirm available venue areas and timing options for your requested date.'],
        ['Build the Reception', 'Review the layout, catering, beverage service, music, speeches, patio needs, and the special moments.'],
        ['Finalize the Date', 'Once the proposal and event terms are approved, complete the agreement and applicable deposit to finalize the booking.']
      ]
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Wedding Reception |Questions',
      items: [
        ['Can PREVA host wedding receptions and related wedding celebrations?', 'Yes. PREVA can host wedding receptions and related celebrations. The events team will recommend the best setup based on your preferred date, guest count, event flow, and production requirements.'],
        ['Can we hold the ceremony at PREVA as well as the reception?', 'Most couples marry at their own church or place of worship and come to PREVA for the reception, and the evening is timed around that service. If you would prefer to hold both in one place, say so on the inquiry form and the events team will confirm which spaces can be set for a ceremony on your date.'],
        ['Does PREVA offer wedding catering?', 'Preva Kitchen can provide catering options for wedding receptions. Menu style and service format are confirmed with the events team for each booking.'],
        ['Can we bring an outside caterer?', 'Licensed and insured outside caterers may be permitted, subject to venue approval and a current certificate of insurance. Preva Kitchen is also available for on-site catering.'],
        ['Who provides the bar, and can we have an open bar or a dry reception?', 'Bar and beverage service is provided in house. Michigan law requires alcohol to be served under the venue license, so outside alcohol cannot be brought in, and valid ID is required for anyone served. Open bar, limited bar, cash bar and alcohol-free receptions are all arrangements the events team will price and confirm with you — tell us which you have in mind on the inquiry form.'],
        ['Can our wedding include a DJ, speeches, stage moments, or special entrances?', 'Music, speeches, presentations, stage moments, and special entrances can be discussed with the events team so the room layout and available production support fit your plan.'],
        ['Can we use the patio during our wedding reception?', 'Patio use may be available depending on weather, venue scheduling, and the wedding plan. Michigan weather makes this a seasonal option, so an indoor alternative is planned alongside it for any date outside the warmer months.'],
        ['How late can the reception run?', 'The end time is agreed with the events team when the booking is planned. It depends on the day of the week, the venue’s licensing, and what else is scheduled that night, so it is confirmed in writing in the proposal rather than left open.'],
        ['Is there parking at the venue?', 'There is parking on site at 13090 Inkster Rd. Arrangements for larger guest counts are confirmed with the events team when the booking is planned.'],
        ['How do we reserve our wedding date?', 'Submit the wedding inquiry with your preferred date and estimated guest count. The events team will confirm availability and provide the applicable proposal, agreement, and deposit terms before the booking is finalized.']
      ]
    },
    related: {
      text: 'Explore related event options as you plan the celebrations around your wedding.',
      items: ['baby-showers', 'birthday-parties']
    },
    finalCta: {
      eyebrow: 'Want to See the Space?',
      title: 'Tour PREVA Before You |Finalize the Wedding Date',
      text: 'Share your preferred date and tell the events team you would like to schedule a venue walkthrough.'
    }
  }
};

/** Cards for the "You May Also Be Planning" grid, keyed by the ids used above. */
export const RELATED_CARDS = {
  'corporate-events': { icon: '💼', title: 'Corporate Events', text: 'Meetings, training days, award dinners and holiday parties.', link: 'Explore Corporate Events →', href: '/corporate-events' },
  'birthday-parties': { icon: '🎂', title: 'Birthday Parties', text: 'Reserved booths, milestone birthdays and private celebrations.', link: 'Explore Birthday Parties →', href: '/birthday-parties' },
  weddings: { icon: '💍', title: 'Weddings', text: 'Wedding receptions with dinner, speeches, music and dancing.', link: 'Explore Weddings →', href: '/weddings' },
  'baby-showers': { icon: '🍼', title: 'Baby & Bridal Showers', text: 'Daytime private rooms, brunch menus and space for gifts and games.', link: 'Explore Showers →', href: '/baby-showers' }
};
