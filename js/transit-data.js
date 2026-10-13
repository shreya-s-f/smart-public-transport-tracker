// Transit.IN - Centralized Transit Data Layer (Pan-India)
// Provides comprehensive data for Delhi, Mumbai, Bangalore, Hyderabad, Chennai, and Pune

const TransitData = {
    cities: ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'],

    cityCoordinates: {
        'Delhi': [28.6304, 77.2177],         // Connaught Place
        'Mumbai': [18.9400, 72.8353],        // CSMT / South Mumbai
        'Bangalore': [12.9716, 77.5946],     // MG Road / Majestic
        'Hyderabad': [17.3850, 78.4867],     // Hitec City / Abids
        'Chennai': [13.0827, 80.2707],       // Central / Marina
        'Pune': [18.5204, 73.8567]           // Shivajinagar / Swargate
    },

    routes: {
        'Delhi': [
            {
                id: '507',
                name: 'Okhla Phase 1 to Connaught Place',
                type: 'AC',
                category: 'Express',
                fare: 40,
                status: 'On Time',
                frequency: 'Every 10 min',
                firstBus: '05:30 AM',
                lastBus: '11:15 PM',
                stops: ['Okhla Phase 1', 'Nehru Place', 'Moolchand', 'Lajpat Nagar', 'India Gate', 'Connaught Place'],
                coordinates: [
                    [28.5300, 77.2710],
                    [28.5494, 77.2528],
                    [28.5670, 77.2340],
                    [28.5700, 77.2370],
                    [28.6129, 77.2295],
                    [28.6304, 77.2177]
                ]
            },
            {
                id: 'Airport-Exp',
                name: 'ISBT Kashmiri Gate to IGI Airport T3',
                type: 'Electric',
                category: 'Airport Express',
                fare: 90,
                status: 'On Time',
                frequency: 'Every 15 min',
                firstBus: '04:30 AM',
                lastBus: '11:45 PM',
                stops: ['ISBT Kashmiri Gate', 'New Delhi Railway Station', 'Dhaula Kuan', 'Mahipalpur', 'Airport T3'],
                coordinates: [
                    [28.6667, 77.2300],
                    [28.6420, 77.2200],
                    [28.5910, 77.1610],
                    [28.5480, 77.1260],
                    [28.5562, 77.1000]
                ]
            },
            {
                id: 'GL-23',
                name: 'Gurgaon Cyber City to Anand Vihar ISBT',
                type: 'AC',
                category: 'Intercity',
                fare: 75,
                status: '10m Delay',
                frequency: 'Every 20 min',
                firstBus: '06:00 AM',
                lastBus: '10:30 PM',
                stops: ['Cyber City', 'IFFCO Chowk', 'Rajokri Border', 'AIIMS', 'Akshardham', 'Anand Vihar'],
                coordinates: [
                    [28.4950, 77.0890],
                    [28.4720, 77.0720],
                    [28.5230, 77.1080],
                    [28.5672, 77.2100],
                    [28.6180, 77.2790],
                    [28.6469, 77.3160]
                ]
            },
            {
                id: '390',
                name: 'Mayur Vihar Phase 3 to AIIMS',
                type: 'Non-AC',
                category: 'Regular',
                fare: 25,
                status: 'On Time',
                frequency: 'Every 12 min',
                firstBus: '05:45 AM',
                lastBus: '10:45 PM',
                stops: ['Mayur Vihar Ph 3', 'Noida More', 'Sarai Kale Khan', 'Lajpat Nagar', 'AIIMS Hospital'],
                coordinates: [
                    [28.6050, 77.3320],
                    [28.6010, 77.2980],
                    [28.5900, 77.2550],
                    [28.5700, 77.2370],
                    [28.5672, 77.2100]
                ]
            },
            {
                id: 'Metro-F1',
                name: 'Saket Metro to Malviya Nagar Ring Road',
                type: 'Electric',
                category: 'Metro Feeder',
                fare: 15,
                status: 'On Time',
                frequency: 'Every 8 min',
                firstBus: '06:00 AM',
                lastBus: '11:00 PM',
                stops: ['Saket Metro', 'Select Citywalk', 'Khirki Village', 'Malviya Nagar Market'],
                coordinates: [
                    [28.5200, 77.2010],
                    [28.5280, 77.2180],
                    [28.5340, 77.2140],
                    [28.5400, 77.2080]
                ]
            }
        ],

        'Mumbai': [
            {
                id: 'BEST-301',
                name: 'Bandra Station West to Juhu Beach',
                type: 'Electric',
                category: 'Coastal',
                fare: 20,
                status: 'On Time',
                frequency: 'Every 10 min',
                firstBus: '06:00 AM',
                lastBus: '11:30 PM',
                stops: ['Bandra Station', 'Turner Road', 'Khar Danda', 'Santacruz West', 'Juhu Beach'],
                coordinates: [
                    [19.0544, 72.8402],
                    [19.0620, 72.8330],
                    [19.0730, 72.8290],
                    [19.0810, 72.8340],
                    [19.0988, 72.8264]
                ]
            },
            {
                id: 'AC-10',
                name: 'Andheri West to BKC Diamond Bourse',
                type: 'AC',
                category: 'Corporate Express',
                fare: 50,
                status: '15m Delay',
                frequency: 'Every 15 min',
                firstBus: '07:00 AM',
                lastBus: '10:00 PM',
                stops: ['Andheri West', 'WEH Metro', 'Bandra Terminus', 'BKC Kalanagar', 'BKC Diamond Bourse'],
                coordinates: [
                    [19.1197, 72.8464],
                    [19.1150, 72.8570],
                    [19.0620, 72.8480],
                    [19.0610, 72.8560],
                    [19.0660, 72.8680]
                ]
            },
            {
                id: 'C-71',
                name: 'Colaba Post Office to CSMT',
                type: 'Electric',
                category: 'Heritage',
                fare: 15,
                status: 'On Time',
                frequency: 'Every 7 min',
                firstBus: '05:30 AM',
                lastBus: '11:59 PM',
                stops: ['Colaba Post Office', 'Regal Cinema', 'Nariman Point', 'Churchgate', 'CSMT Station'],
                coordinates: [
                    [18.9100, 72.8150],
                    [18.9250, 72.8320],
                    [18.9260, 72.8220],
                    [18.9350, 72.8270],
                    [18.9400, 72.8353]
                ]
            },
            {
                id: 'BEST-42',
                name: 'Dadar TT Circle to Worli Sea Face',
                type: 'Non-AC',
                category: 'Regular',
                fare: 20,
                status: 'On Time',
                frequency: 'Every 10 min',
                firstBus: '06:00 AM',
                lastBus: '10:30 PM',
                stops: ['Dadar TT', 'Prabhadevi', 'Century Bazaar', 'Worli Naka', 'Worli Sea Face'],
                coordinates: [
                    [19.0178, 72.8478],
                    [19.0140, 72.8290],
                    [19.0100, 72.8200],
                    [19.0060, 72.8180],
                    [19.0080, 72.8120]
                ]
            }
        ],

        'Bangalore': [
            {
                id: 'V-500D',
                name: 'Silk Board Junction to Hebbal Flyover',
                type: 'AC',
                category: 'Outer Ring Road Vajra',
                fare: 85,
                status: 'Heavy Traffic',
                frequency: 'Every 8 min',
                firstBus: '05:30 AM',
                lastBus: '11:30 PM',
                stops: ['Silk Board', 'HSR Layout', 'Bellandur Tech Park', 'Marathahalli', 'Kalyan Nagar', 'Hebbal'],
                coordinates: [
                    [12.9172, 77.6228],
                    [12.9110, 77.6380],
                    [12.9304, 77.6784],
                    [12.9560, 77.7010],
                    [13.0280, 77.6400],
                    [13.0358, 77.5970]
                ]
            },
            {
                id: 'KIA-9',
                name: 'Kempegowda Majestic to KIA Bangalore Airport',
                type: 'Electric',
                category: 'Airport Vayu Vajra',
                fare: 260,
                status: 'On Time',
                frequency: 'Every 15 min',
                firstBus: '24 Hours (Every 20m)',
                lastBus: '24 Hours',
                stops: ['Majestic Station', 'Mekhri Circle', 'Hebbal', 'Yelahanka Bypass', 'KIA Terminal 1 & 2'],
                coordinates: [
                    [12.9772, 77.5713],
                    [13.0110, 77.5850],
                    [13.0358, 77.5970],
                    [13.1000, 77.5960],
                    [13.1986, 77.7066]
                ]
            },
            {
                id: '335E',
                name: 'KBS Majestic to Whitefield ITPL',
                type: 'AC',
                category: 'Tech Corridor',
                fare: 70,
                status: '10m Delay',
                frequency: 'Every 12 min',
                firstBus: '06:00 AM',
                lastBus: '10:45 PM',
                stops: ['Majestic', 'Corporation', 'Domlur Flyover', 'HAL Main Gate', 'Kundalahalli', 'ITPL Whitefield'],
                coordinates: [
                    [12.9772, 77.5713],
                    [12.9680, 77.5900],
                    [12.9610, 77.6380],
                    [12.9560, 77.6750],
                    [12.9670, 77.7120],
                    [12.9860, 77.7380]
                ]
            },
            {
                id: 'G-4',
                name: 'Brigade Road to Electronic City Phase 1',
                type: 'Electric',
                category: 'Metro Feeder',
                fare: 45,
                status: 'On Time',
                frequency: 'Every 15 min',
                firstBus: '06:30 AM',
                lastBus: '10:30 PM',
                stops: ['Brigade Road', 'Koramangala Sony World', 'Madivala Checkpost', 'Bommanahalli', 'Electronic City Ph 1'],
                coordinates: [
                    [12.9716, 77.6070],
                    [12.9360, 77.6270],
                    [12.9220, 77.6200],
                    [12.9080, 77.6240],
                    [12.8450, 77.6600]
                ]
            }
        ],

        'Hyderabad': [
            {
                id: 'TSRTC-100M',
                name: 'Secunderabad Station to Mehdipatnam',
                type: 'Electric',
                category: 'City Express',
                fare: 35,
                status: 'On Time',
                frequency: 'Every 10 min',
                firstBus: '05:30 AM',
                lastBus: '11:00 PM',
                stops: ['Secunderabad', 'Paradise', 'Tank Bund / Hussain Sagar', 'Lakdikapul', 'Mehdipatnam'],
                coordinates: [
                    [17.4399, 78.4983],
                    [17.4410, 78.4870],
                    [17.4239, 78.4738],
                    [17.4040, 78.4630],
                    [17.3916, 78.4415]
                ]
            },
            {
                id: 'Pushpak-Airport',
                name: 'Jubilee Bus Station to RGIA Airport Shamshabad',
                type: 'AC',
                category: 'Pushpak Liner',
                fare: 220,
                status: 'On Time',
                frequency: 'Every 20 min',
                firstBus: '04:00 AM',
                lastBus: '11:30 PM',
                stops: ['JBS Secunderabad', 'Begumpet', 'Panjagutta', 'Gachibowli Outer Ring', 'RGIA Airport'],
                coordinates: [
                    [17.4500, 78.4960],
                    [17.4420, 78.4660],
                    [17.4260, 78.4520],
                    [17.4400, 78.3489],
                    [17.2403, 78.4294]
                ]
            },
            {
                id: '216-IT',
                name: 'Koti Women\'s College to Hitec City Cyber Towers',
                type: 'Electric',
                category: 'IT Express',
                fare: 50,
                status: '5m Delay',
                frequency: 'Every 12 min',
                firstBus: '06:30 AM',
                lastBus: '10:30 PM',
                stops: ['Koti', 'Abids', 'Ameerpet', 'Madhapur', 'Hitec City Cyber Towers'],
                coordinates: [
                    [17.3871, 78.4820],
                    [17.3920, 78.4740],
                    [17.4375, 78.4483],
                    [17.4486, 78.3908],
                    [17.4504, 78.3808]
                ]
            }
        ],

        'Chennai': [
            {
                id: 'MTC-23C',
                name: 'Besant Nagar to Ayanavaram',
                type: 'Electric',
                category: 'City Deluxe',
                fare: 30,
                status: 'On Time',
                frequency: 'Every 10 min',
                firstBus: '05:45 AM',
                lastBus: '10:30 PM',
                stops: ['Besant Nagar', 'Adyar Signal', 'Mylapore Luz', 'Gemini Flyover', 'Kilpauk', 'Ayanavaram'],
                coordinates: [
                    [12.9982, 78.2678],
                    [13.0067, 78.2570],
                    [13.0330, 78.2670],
                    [13.0520, 78.2500],
                    [13.0800, 78.2430],
                    [13.0990, 78.2320]
                ]
            },
            {
                id: 'MTC-570',
                name: 'Koyambedu CMBT to Siruseri IT Park OMR',
                type: 'AC',
                category: 'OMR IT Corridor',
                fare: 65,
                status: '8m Delay',
                frequency: 'Every 15 min',
                firstBus: '06:00 AM',
                lastBus: '11:00 PM',
                stops: ['CMBT Koyambedu', 'Guindy Kathipara', 'Velachery', 'Thoraipakkam OMR', 'Siruseri IT Park'],
                coordinates: [
                    [13.0694, 80.2057],
                    [13.0067, 80.2025],
                    [12.9750, 80.2200],
                    [12.9380, 80.2370],
                    [12.8250, 80.2220]
                ]
            }
        ],

        'Pune': [
            {
                id: 'Rainbow-102',
                name: 'Swargate to Nigdi BRTS Corridor',
                type: 'Electric',
                category: 'Rainbow BRTS',
                fare: 40,
                status: 'On Time',
                frequency: 'Every 6 min',
                firstBus: '05:30 AM',
                lastBus: '11:45 PM',
                stops: ['Swargate', 'Shivajinagar', 'Khadki Bazaar', 'Pimpri Chinchwad', 'Nigdi Pradhikaran'],
                coordinates: [
                    [18.5018, 73.8580],
                    [18.5314, 73.8446],
                    [18.5630, 73.8340],
                    [18.6280, 73.8050],
                    [18.6530, 73.7660]
                ]
            },
            {
                id: 'Hinjawadi-348',
                name: 'Pune Railway Station to Hinjawadi Phase 3 IT Park',
                type: 'AC',
                category: 'Metro Feeder IT',
                fare: 60,
                status: '12m Delay',
                frequency: 'Every 10 min',
                firstBus: '06:30 AM',
                lastBus: '11:00 PM',
                stops: ['Pune Station', 'University Circle', 'Aundh Rajiv Gandhi Bridge', 'Wakad Bridge', 'Hinjawadi Phase 3'],
                coordinates: [
                    [18.5284, 73.8739],
                    [18.5410, 73.8290],
                    [18.5610, 73.8070],
                    [18.5980, 73.7640],
                    [18.5910, 73.6990]
                ]
            }
        ]
    },

    alerts: {
        'Delhi': [
            { type: 'alert', title: 'Route 507 - Nehru Place Flyover', message: 'Heavy slow-moving traffic on Ring Road. Expect +10 min transit time.', time: '5 mins ago', route: '507' },
            { type: 'info', title: 'New Electric Fleet Added', message: '100 new 100% zero-emission electric low-floor buses deployed on Airport Route.', time: '1 hour ago', route: 'Airport-Exp' }
        ],
        'Mumbai': [
            { type: 'warning', title: 'Sea Link Diversion', message: 'Route AC-10 diverted via Bandra Worli Sea Link due to metro pillar work in Bandra.', time: '15 mins ago', route: 'AC-10' },
            { type: 'info', title: 'Double Decker Electric Bus Active', message: 'Iconic heritage electric double deckers now operating on South Mumbai Coastal Route.', time: '2 hours ago', route: 'C-71' }
        ],
        'Bangalore': [
            { type: 'alert', title: 'Silk Board Peak Hour Congestion', message: 'Severe bottle-neck at Silk Board signal. BMTC Vajra V-500D running with 15m delay.', time: 'Just now', route: 'V-500D' },
            { type: 'info', title: '24x7 Vayu Vajra Airport Schedule', message: 'Buses to Kempegowda International Airport depart round-the-clock every 15-20 minutes.', time: '4 hours ago', route: 'KIA-9' }
        ],
        'Hyderabad': [
            { type: 'warning', title: 'Hussain Sagar Lake Rerouting', message: 'Tank Bund road closed for evening promenade. TSRTC Route 100M running via Lower Tank Bund.', time: '30 mins ago', route: 'TSRTC-100M' }
        ],
        'Chennai': [
            { type: 'alert', title: 'OMR Road Widening Notice', message: 'Expect slight delays near Thoraipakkam junction on Route 570 IT Express.', time: '1 hour ago', route: 'MTC-570' }
        ],
        'Pune': [
            { type: 'info', title: 'Rainbow BRTS Priority Corridor Open', message: 'Dedicated bus lanes active on Swargate - Nigdi corridor. Travel time cut by 25%.', time: '45 mins ago', route: 'Rainbow-102' }
        ]
    },

    // Get all routes for a city including custom routes saved by Admin
    getAllRoutesForCity(city) {
        const defaultList = this.routes[city] || this.routes['Delhi'] || [];
        let customList = [];
        try {
            const stored = JSON.parse(localStorage.getItem('spt-custom-routes')) || [];
            customList = stored.filter(r => r.city === city).map(r => ({
                id: r.id,
                name: r.path,
                type: 'AC',
                category: 'Custom Route',
                fare: parseInt(String(r.fare).replace(/\D/g, '')) || 35,
                status: r.status || 'Active',
                frequency: 'Every 15 min',
                firstBus: r.first || '06:00 AM',
                lastBus: r.last || '10:00 PM',
                stops: r.path ? r.path.split(/\s*➔\s*|\s*->\s*/) : ['Origin', 'Destination'],
                coordinates: []
            }));
        } catch (e) {}
        return [...customList, ...defaultList];
    },

    // Get all cities including custom added cities
    getAllCities() {
        let customCities = [];
        try {
            customCities = JSON.parse(localStorage.getItem('spt-custom-cities')) || [];
        } catch(e) {}
        return [...new Set([...this.cities, ...customCities])];
    }
};

if (typeof window !== 'undefined') {
    window.TransitData = TransitData;
}
