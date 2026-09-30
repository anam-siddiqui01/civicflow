import type { Action, CitizenActionResponse, CitizenNotification, CitizenReport, IssueCluster } from '../types'

export const issueClusters: IssueCluster[] = [
  { id: 'issue-water-12', title: 'Water Supply Disruption', category: 'Water & sanitation', location: 'Lakeview, Ward 12', ward: 12, reportCount: 137, priorityScore: 94, priorityLevel: 'Critical', trend: 'Rising', trendChangePercent: 38, trendWindowHours: 24, evidenceCount: 42, photoCount: 42, status: 'In progress', suggestedDepartment: 'Water & Public Works', aiSummary: 'Residents across Lakeview report an intermittent water supply in English, Hindi, and Marathi. Repeated reports and attached photos point to a shared disruption affecting the same ward.', recommendedAction: 'Request field verification and assess temporary water-supply arrangements.', urgency: 'Critical', severity: 'High', essentialService: true, essentialServiceImpact: 90, essentialServiceImpactReason: 'A neighborhood water-supply interruption affects a core daily service.', vulnerabilityImpact: 95, vulnerabilityImpactReason: 'Households with limited stored water have fewer alternatives during an interruption.', affectedPopulationEstimate: 2800, affectedHouseholdsEstimate: 820, languageCounts: { Hindi: 61, Marathi: 42, English: 34 }, inputTypeCounts: { Voice: 76, Text: 19, Photo: 42 } },
  { id: 'issue-garbage-7', title: 'Garbage Accumulation', category: 'Sanitation', location: 'Market Road, Ward 7', ward: 7, reportCount: 8, priorityScore: 82, priorityLevel: 'High', trend: 'Rising', evidenceCount: 2, photoCount: 2, status: 'Action planned', suggestedDepartment: 'Sanitation Services', aiSummary: 'Overflowing collection points have been reported near the market entrance and bus stop, with multiple recent photo submissions.', recommendedAction: 'Schedule sanitation inspection and verify accumulation at the reported location.', urgency: 'High', severity: 'High', essentialService: true, essentialServiceImpact: 70, essentialServiceImpactReason: 'Accumulated waste can disrupt sanitation service around a busy public market.', vulnerabilityImpact: 75, vulnerabilityImpactReason: 'Market users and nearby residents have repeated exposure to the affected collection point.', affectedPopulationEstimate: 1250, languageCounts: { English: 3, Hindi: 3, Marathi: 2 }, inputTypeCounts: { Voice: 3, Text: 3, Photo: 2 } },
  { id: 'issue-road-4', title: 'Road Damage', category: 'Roads & transport', location: 'Cedar Avenue, Ward 4', ward: 4, reportCount: 7, priorityScore: 74, priorityLevel: 'High', trend: 'Stable', evidenceCount: 2, photoCount: 2, status: 'Needs review', suggestedDepartment: 'Roads & Public Works', aiSummary: 'Several reports identify potholes along the eastbound lane, including one near a pedestrian crossing.', recommendedAction: 'Conduct field inspection and assess road condition and safety risk.', urgency: 'High', severity: 'High', essentialService: false, essentialServiceImpact: 15, essentialServiceImpactReason: 'No critical facility dependency is reported for this road segment.', vulnerabilityImpact: 55, vulnerabilityImpactReason: 'The location is used by regular road traffic, with a reported crossing nearby.', affectedPopulationEstimate: 700, languageCounts: { English: 4, Hindi: 2, Marathi: 1 }, inputTypeCounts: { Voice: 2, Text: 3, Photo: 2 } },
  { id: 'issue-parking-8', title: 'Parking / Lane Obstruction', category: 'Roads & transport', location: 'Juniper Street, Ward 8', ward: 8, reportCount: 24, priorityScore: 68, priorityLevel: 'High', trend: 'Rising', evidenceCount: 10, photoCount: 10, status: 'Needs review', suggestedDepartment: 'Traffic / Municipal Enforcement', aiSummary: 'English, Hindi, and Marathi reports describe parked vehicles blocking access through a narrow residential lane near the community center.', recommendedAction: 'Conduct a field inspection during the reported peak period and assess the obstruction.', urgency: 'High', severity: 'High', essentialService: false, essentialServiceImpact: 25, essentialServiceImpactReason: 'The lane may provide local access but is not identified as a critical route.', vulnerabilityImpact: 70, vulnerabilityImpactReason: 'A narrow shared lane affects residents and access for larger vehicles.', affectedPopulationEstimate: 450, languageCounts: { English: 8, Hindi: 9, Marathi: 7 }, inputTypeCounts: { Voice: 8, Text: 6, Photo: 10 } },
  { id: 'issue-lights-3', title: 'Streetlight Outage', category: 'Public spaces', location: 'Willow Park, Ward 3', ward: 3, reportCount: 3, priorityScore: 42, priorityLevel: 'Medium', trend: 'Falling', evidenceCount: 1, photoCount: 1, status: 'Resolved', suggestedDepartment: 'Electrical Services', aiSummary: 'A group of lights along the park footpath was reported offline. A maintenance visit was recorded this week.', recommendedAction: 'Confirm the repaired lights are working after dusk and close the issue if residents report no further outage.', urgency: 'Moderate', severity: 'Moderate', essentialService: false, essentialServiceImpact: 0, vulnerabilityImpact: 30, vulnerabilityImpactReason: 'A public footpath was affected, with no critical facility identified.', affectedPopulationEstimate: 110, languageCounts: { English: 2, Hindi: 1 }, inputTypeCounts: { Voice: 1, Text: 1, Photo: 1 } },
  { id: 'issue-hospital-power-2', title: 'Hospital Electricity Outage', category: 'Healthcare & essential infrastructure', location: 'Central Hospital, Ward 2', ward: 2, reportCount: 1, priorityScore: 92, priorityLevel: 'Critical', trend: 'Stable', evidenceCount: 0, photoCount: 0, status: 'Needs review', suggestedDepartment: 'Hospital Facilities & Electrical Services', aiSummary: 'One report says backup power is unavailable in the hospital emergency department, requiring immediate verification of critical equipment and continuity arrangements.', recommendedAction: 'Urgently verify backup power with hospital facilities staff and assess continuity for critical care equipment.', urgency: 'Critical', severity: 'Critical', essentialService: true, essentialServiceImpact: 100, essentialServiceImpactReason: 'The outage affects backup power at an operating hospital and may interrupt critical care equipment.', vulnerabilityImpact: 100, vulnerabilityImpactReason: 'Patients who depend on continuous clinical support are highly vulnerable to a power interruption.', affectedPopulationEstimate: 600, languageCounts: { English: 1 }, inputTypeCounts: { Text: 1 } },
  { id: 'issue-pothole-9', title: 'Residential Road Pothole', category: 'Roads & transport', location: 'Oak Street, Ward 9', ward: 9, reportCount: 20, priorityScore: 58, priorityLevel: 'High', trend: 'Rising', trendChangePercent: 18, trendWindowHours: 24, evidenceCount: 8, photoCount: 8, status: 'Needs review', suggestedDepartment: 'Roads & Public Works', aiSummary: 'Residents report a pothole on an ordinary residential road; vehicles are slowing and swerving, but no essential-service facility is identified nearby.', recommendedAction: 'Inspect the pothole, verify its dimensions, and determine a repair priority based on road-safety conditions.', urgency: 'Moderate', severity: 'Moderate', essentialService: false, essentialServiceImpact: 20, essentialServiceImpactReason: 'This is an ordinary residential road with no identified critical-service dependency.', vulnerabilityImpact: 80, vulnerabilityImpactReason: 'The damaged surface creates repeated exposure for pedestrians, cyclists, and local traffic.', affectedPopulationEstimate: 600, languageCounts: { English: 8, Hindi: 8, Marathi: 4 }, inputTypeCounts: { Voice: 4, Text: 8, Photo: 8 } },
]

const representativeCitizenReports: CitizenReport[] = [
  { id: 'CF-2026-1042', description: 'Water pressure is very low on the upper floors and the supply stops most evenings.', category: 'Water & sanitation', location: 'Lakeview, Ward 12', ward: 12, language: 'English', inputType: 'Photo', imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=240&q=80', status: 'In progress', createdAt: '2026-09-26T09:18:00', issueClusterId: 'issue-water-12' },
  { id: 'CF-2026-1041', description: 'हमारे इलाके में तीन दिन से पानी नहीं आ रहा।', category: 'Water & sanitation', location: 'Lakeview, Ward 12', ward: 12, language: 'Hindi', inputType: 'Photo', imageUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=480&q=80', status: 'In progress', createdAt: '2026-09-26T08:42:00', issueClusterId: 'issue-water-12' },
  { id: 'CF-2026-1040', description: 'आमच्या भागात तीन दिवसांपासून पाणीपुरवठा बंद आहे.', category: 'Water & sanitation', location: 'Lakeview, Ward 12', ward: 12, language: 'Marathi', inputType: 'Photo', imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=480&q=80', status: 'In progress', createdAt: '2026-09-26T08:26:00', issueClusterId: 'issue-water-12' },
  { id: 'CF-2026-1039', description: 'The bins are overflowing again beside the market bus stop.', category: 'Sanitation', location: 'Market Road bus stop', ward: 7, language: 'English', inputType: 'Photo', imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=480&q=80', status: 'Action planned', createdAt: '2026-09-25T16:05:00', issueClusterId: 'issue-garbage-7' },
  { id: 'CF-2026-1038', description: 'Kachra jama ho raha hai, please send the collection team.', category: 'Sanitation', location: 'Old Market entrance', ward: 7, language: 'Hindi', inputType: 'Text', imageUrl: null, status: 'Action planned', createdAt: '2026-09-25T14:30:00', issueClusterId: 'issue-garbage-7' },
  { id: 'CF-2026-1035', description: 'Large pothole before the crossing. Two-wheelers are swerving into traffic.', category: 'Roads & transport', location: 'Cedar Avenue crossing', ward: 4, language: 'English', inputType: 'Photo', imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=480&q=80', status: 'Under review', createdAt: '2026-09-24T11:50:00', issueClusterId: 'issue-road-4' },
  { id: 'CF-2026-1033', description: 'There is a deep crack in the left lane outside the library.', category: 'Roads & transport', location: 'Cedar Avenue library', ward: 4, language: 'English', inputType: 'Text', imageUrl: null, status: 'Under review', createdAt: '2026-09-24T09:20:00', issueClusterId: 'issue-road-4' },
  { id: 'CF-2026-1029', description: 'Vehicles are blocking the lane near the community center.', category: 'Parking / Traffic', location: 'Community Center lane', ward: 8, language: 'English', inputType: 'Text', imageUrl: null, status: 'Received', createdAt: '2026-09-23T17:15:00', issueClusterId: 'issue-parking-8' },
  { id: 'CF-2026-1027', description: 'The street lamps by the park entrance have been out for several nights.', category: 'Public spaces', location: 'Willow Park entrance', ward: 3, language: 'English', inputType: 'Voice', imageUrl: null, status: 'Resolved', createdAt: '2026-09-22T20:40:00', issueClusterId: 'issue-lights-3' },
  { id: 'CF-2026-1025', description: 'Water supply has become irregular around the north block.', category: 'Water & sanitation', location: 'North Lakeview block', ward: 12, language: 'English', inputType: 'Text', imageUrl: null, status: 'In progress', createdAt: '2026-09-22T10:13:00', issueClusterId: 'issue-water-12' },
  { id: 'CF-2026-1022', description: 'Waste pickup has not happened for three days near the lane.', category: 'Sanitation', location: 'Market Lane, Ward 7', ward: 7, language: 'English', inputType: 'Text', imageUrl: null, status: 'Action planned', createdAt: '2026-09-21T13:27:00', issueClusterId: 'issue-garbage-7' },
  { id: 'CF-2026-1019', description: 'Potholes are getting wider after the rain; please inspect the road.', category: 'Roads & transport', location: 'Cedar Avenue', ward: 4, language: 'English', inputType: 'Photo', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=480&q=80', status: 'Under review', createdAt: '2026-09-20T08:55:00', issueClusterId: 'issue-road-4' },
  { id: 'CF-2026-1016', description: 'A delivery van blocks the junction sightline most mornings.', category: 'Roads & transport', location: 'Juniper Street junction', ward: 8, language: 'English', inputType: 'Text', imageUrl: null, status: 'Received', createdAt: '2026-09-19T07:35:00', issueClusterId: 'issue-parking-8' },
  { id: 'CF-2026-1013', description: 'कम्युनिटी सेंटर के पास गाड़ियां सड़क पर खड़ी रहती हैं और रास्ता बंद हो जाता है।', category: 'Parking / Traffic', location: 'Community Center lane', ward: 8, language: 'Hindi', inputType: 'Photo', imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=480&q=80', status: 'Under review', createdAt: '2026-09-18T10:10:00', issueClusterId: 'issue-parking-8' },
  { id: 'CF-2026-1011', description: 'कम्युनिटी सेंटरजवळ गाड्या रस्त्यावर उभ्या केल्यामुळे रस्ता अडतो.', category: 'Parking / Traffic', location: 'Community Center lane', ward: 8, language: 'Marathi', inputType: 'Voice', imageUrl: null, status: 'Under review', createdAt: '2026-09-17T11:35:00', issueClusterId: 'issue-parking-8' },
]

type DemoLanguage = 'English' | 'Hindi' | 'Marathi'

interface DemoReportGroup {
  firstSequence: number
  issueClusterId: string
  category: string
  ward: number
  locations: string[]
  status: CitizenReport['status']
  languageCounts: Record<DemoLanguage, number>
  inputTypeCounts: Record<CitizenReport['inputType'], number>
  descriptions: Record<DemoLanguage, string[]>
  photoUrls: string[]
  createdAt?: string
}

function interleaveCounts<T extends string>(counts: Partial<Record<T, number>>): T[] {
  const remaining = (Object.entries(counts) as [T, number][]).filter(([, count]) => count > 0)
  const values: T[] = []
  while (remaining.some(([, count]) => count > 0)) {
    for (const entry of remaining) {
      if (entry[1] > 0) {
        values.push(entry[0])
        entry[1] -= 1
      }
    }
  }
  return values
}

function createDemoReports(group: DemoReportGroup): CitizenReport[] {
  const languages = interleaveCounts(group.languageCounts)
  const inputTypes = interleaveCounts(group.inputTypeCounts)
  return languages.map((language, index) => {
    const inputType = inputTypes[index]
    const day = group.issueClusterId === 'issue-water-12'
      ? index < 29 ? 30 : index < 50 ? 29 : 18 + ((index - 50) % 11)
      : 19 + ((index * 5) % 12)
    const hour = 7 + ((index * 7) % 11)
    const minute = (index * 17) % 60
    return {
      id: `CF-2026-${String(group.firstSequence + index).padStart(4, '0')}`,
      description: group.descriptions[language][index % group.descriptions[language].length],
      category: group.category,
      location: group.locations[index % group.locations.length],
      ward: group.ward,
      language,
      inputType,
      imageUrl: inputType === 'Photo' ? group.photoUrls[index % group.photoUrls.length] : null,
      status: group.status,
      createdAt: group.createdAt ?? `2026-09-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`,
      issueClusterId: group.issueClusterId,
    }
  })
}

const generatedCitizenReports = [
  ...createDemoReports({
    firstSequence: 1100,
    issueClusterId: 'issue-water-12',
    category: 'Water & sanitation',
    ward: 12,
    locations: ['Lakeview North Block, Ward 12', 'Lakeview Clinic Lane, Ward 12', 'Lakeview Road, Ward 12', 'Lakeview Community Tap, Ward 12'],
    status: 'In progress',
    languageCounts: { English: 32, Hindi: 60, Marathi: 41 },
    inputTypeCounts: { Voice: 76, Text: 18, Photo: 39 },
    descriptions: {
      English: ['No water has reached our building since morning.', 'Water pressure has been very low for three days.', 'The evening supply has stopped again in our block.', 'Taps are dry and residents are sharing stored water.'],
      Hindi: ['हमारे इलाके में पानी नहीं आ रहा है।', 'तीन दिन से पानी की आपूर्ति बंद है।', 'सुबह से नल में पानी नहीं आया।', 'पानी का दबाव बहुत कम है और शाम की आपूर्ति रुक जाती है।'],
      Marathi: ['आमच्या भागात पाणीपुरवठा बंद आहे.', 'तीन दिवसांपासून पाणी येत नाही.', 'सकाळपासून नळाला पाणी आलेले नाही.', 'संध्याकाळचा पाणीपुरवठा पुन्हा थांबला आहे.'],
    },
    photoUrls: ['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=480&q=80', 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=480&q=80', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=480&q=80'],
  }),
  ...createDemoReports({
    firstSequence: 1300,
    issueClusterId: 'issue-parking-8',
    category: 'Parking / Traffic',
    ward: 8,
    locations: ['Community Center Lane, Ward 8', 'Juniper Street, Ward 8', 'Community Hall Entrance, Ward 8'],
    status: 'Under review',
    languageCounts: { English: 6, Hindi: 8, Marathi: 6 },
    inputTypeCounts: { Voice: 7, Text: 4, Photo: 9 },
    descriptions: {
      English: ['Parked cars are blocking the lane near the community center.', 'Vehicles leave too little room for residents to pass.', 'Cars are regularly blocking the emergency access lane.'],
      Hindi: ['सामुदायिक केंद्र के पास गाड़ियां रास्ता रोक रही हैं।', 'गली में खड़ी गाड़ियों से लोगों को निकलने में परेशानी है।', 'वाहनों के कारण आपातकालीन रास्ता बंद हो जाता है।'],
      Marathi: ['समुदाय केंद्राजवळ गाड्या उभ्या आहेत आणि रस्ता अडतो.', 'गल्लीत उभ्या वाहनांमुळे रहिवाशांना जाणे कठीण झाले आहे.', 'वाहनांमुळे आपत्कालीन मार्ग अडला आहे.'],
    },
    photoUrls: ['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=480&q=80', 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=480&q=80'],
  }),
  ...createDemoReports({
    firstSequence: 1320,
    issueClusterId: 'issue-garbage-7',
    category: 'Sanitation',
    ward: 7,
    locations: ['Market Road Bus Stop, Ward 7', 'Old Market Entrance, Ward 7'],
    status: 'Action planned',
    languageCounts: { English: 1, Hindi: 2, Marathi: 2 },
    inputTypeCounts: { Voice: 3, Text: 1, Photo: 1 },
    descriptions: { English: ['Waste has been building up beside the market bins.'], Hindi: ['बाजार के पास कूड़ा जमा हो रहा है।'], Marathi: ['बाजाराजवळ कचरा साचला आहे.'] },
    photoUrls: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=480&q=80'],
  }),
  ...createDemoReports({
    firstSequence: 1330,
    issueClusterId: 'issue-road-4',
    category: 'Roads & transport',
    ward: 4,
    locations: ['Cedar Avenue Crossing, Ward 4', 'Cedar Avenue Library, Ward 4'],
    status: 'Under review',
    languageCounts: { English: 1, Hindi: 2, Marathi: 1 },
    inputTypeCounts: { Voice: 2, Text: 2, Photo: 0 },
    descriptions: { English: ['A pothole is spreading near the crossing.'], Hindi: ['चौराहे के पास सड़क पर बड़ा गड्ढा है।'], Marathi: ['चौकाजवळ रस्त्यावर मोठा खड्डा आहे.'] },
    photoUrls: ['https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=480&q=80'],
  }),
  ...createDemoReports({
    firstSequence: 1340,
    issueClusterId: 'issue-lights-3',
    category: 'Public spaces',
    ward: 3,
    locations: ['Willow Park Footpath, Ward 3'],
    status: 'Resolved',
    languageCounts: { English: 1, Hindi: 1, Marathi: 0 },
    inputTypeCounts: { Voice: 0, Text: 1, Photo: 1 },
    descriptions: { English: ['The lights along the park path are working again.'], Hindi: ['पार्क के रास्ते की बत्तियां फिर से जल रही हैं।'], Marathi: ['उद्यानातील दिवे पुन्हा सुरू झाले आहेत.'] },
    photoUrls: ['https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=480&q=80'],
  }),
  ...createDemoReports({
    firstSequence: 1350,
    issueClusterId: 'issue-pothole-9',
    category: 'Roads & transport',
    ward: 9,
    locations: ['Oak Street, Ward 9', 'Oak Street Residential Lane, Ward 9'],
    status: 'Under review',
    languageCounts: { English: 8, Hindi: 8, Marathi: 4 },
    inputTypeCounts: { Voice: 4, Text: 8, Photo: 8 },
    descriptions: {
      English: ['A pothole is opening up on this residential road.', 'Cars are swerving around a pothole on Oak Street.', 'The road surface is broken near the homes on this block.'],
      Hindi: ['रिहायशी सड़क पर गड्ढा है और वाहन बचकर निकल रहे हैं।', 'ओक स्ट्रीट पर गड्ढे के कारण गाड़ियां मुड़ रही हैं।', 'घर के पास सड़क की सतह टूट गई है।'],
      Marathi: ['वस्तीतील रस्त्यावर खड्डा पडला आहे.', 'ओक स्ट्रीटवरील खड्डा टाळण्यासाठी वाहने वळत आहेत.', 'घरांजवळ रस्त्याचा पृष्ठभाग खराब झाला आहे.'],
    },
    photoUrls: ['https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=480&q=80', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=480&q=80'],
  }),
  ...createDemoReports({
    firstSequence: 1370,
    issueClusterId: 'issue-hospital-power-2',
    category: 'Healthcare & essential infrastructure',
    ward: 2,
    locations: ['Central Hospital Emergency Department, Ward 2'],
    status: 'Under review',
    languageCounts: { English: 1, Hindi: 0, Marathi: 0 },
    inputTypeCounts: { Voice: 0, Text: 1, Photo: 0 },
    descriptions: { English: ['Emergency department backup power is down; critical equipment needs an immediate continuity check.'], Hindi: [], Marathi: [] },
    photoUrls: ['https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=480&q=80'],
    createdAt: '2026-09-30T08:20:00',
  }),
]

export const citizenReports: CitizenReport[] = [...representativeCitizenReports, ...generatedCitizenReports]

export const actions: Action[] = [
  { id: 'action-301', issueId: 'issue-water-12', status: 'Confirmed', expectedDate: '2026-10-01', expectedTimeWindow: '9:00 AM – 12:00 PM', preparationInstructions: 'Keep the building access point clear. A representative may be asked to confirm whether water pressure improves during the visit.', officerNote: 'Field team visit confirmed in the demo office.', citizenConflict: false, createdAt: '2026-09-26T12:00:00', expectedSteps: ['Field inspection', 'Evidence verification', 'Assessment of supply disruption', 'Consider temporary arrangements'], workflowStage: 'CITIZEN NOTIFIED', department: 'Water & Public Works', fieldOfficer: 'Asha Menon', aiDraftActionPlan: 'Request field verification and assess temporary water-supply arrangements.', approvedActionPlan: 'Request field verification and assess temporary water-supply arrangements.', actionPlanApproved: true, citizenNotifiedAt: '2026-09-26T12:02:00', timeline: [{ label: 'Report received', createdAt: '2026-09-21T08:10:00' }, { label: 'Issue clustered', createdAt: '2026-09-21T11:45:00' }, { label: 'Officer reviewed', createdAt: '2026-09-24T14:20:00', note: 'Reviewed by Asha Menon' }, { label: 'Action scheduled', createdAt: '2026-09-25T10:30:00' }, { label: 'Citizen notified', createdAt: '2026-09-26T12:02:00' }] },
  { id: 'action-298', issueId: 'issue-garbage-7', status: 'Proposed', expectedDate: '2026-10-01', expectedTimeWindow: '7:00 AM – 10:00 AM', preparationInstructions: 'Please keep the collection point accessible and avoid placing bulky waste beside the bins before pickup.', officerNote: 'Collection visit proposed, pending department confirmation.', citizenConflict: false, createdAt: '2026-09-25T15:00:00', expectedSteps: ['Collection-point inspection', 'Evidence verification', 'Assessment of sanitation needs', 'Determine an appropriate next step'], workflowStage: 'ACTION PLANNED', department: 'Sanitation Services', fieldOfficer: 'Rohan Kulkarni', aiDraftActionPlan: 'Schedule sanitation inspection and verify accumulation at the reported location.', approvedActionPlan: 'Schedule sanitation inspection and verify accumulation at the reported location.', actionPlanApproved: true, timeline: [{ label: 'Report received', createdAt: '2026-09-20T13:27:00' }, { label: 'Issue clustered', createdAt: '2026-09-21T09:00:00' }, { label: 'Officer reviewed', createdAt: '2026-09-24T10:15:00', note: 'Reviewed by Rohan Kulkarni' }, { label: 'Action scheduled', createdAt: '2026-09-25T15:00:00' }] },
  { id: 'action-299', issueId: 'issue-parking-8', status: 'Expected', expectedDate: '2026-10-02', expectedTimeWindow: '10:00 AM – 12:00 PM', preparationInstructions: 'Please keep the affected lane accessible during the expected inspection window.', officerNote: 'Citizen notification sent; the expected window remains subject to change.', citizenConflict: false, createdAt: '2026-09-30T08:00:00', expectedSteps: ['Field inspection', 'Evidence verification', 'Assessment of obstruction', 'Appropriate action according to applicable rules'], workflowStage: 'CITIZEN NOTIFIED', department: 'Traffic / Municipal Enforcement', fieldOfficer: 'Meera Joshi', aiDraftActionPlan: 'Conduct a field inspection during the reported peak period and assess the obstruction.', approvedActionPlan: 'Conduct a field inspection during the reported peak period and assess the obstruction.', actionPlanApproved: true, citizenNotifiedAt: '2026-09-30T08:30:00', timeline: [{ label: 'Report received', createdAt: '2026-09-17T11:35:00' }, { label: 'Issue clustered', createdAt: '2026-09-18T10:10:00' }, { label: 'Officer reviewed', createdAt: '2026-09-30T08:00:00', note: 'Reviewed by Meera Joshi' }, { label: 'Action scheduled', createdAt: '2026-09-30T08:15:00', note: 'Plan approved by Meera Joshi' }, { label: 'Citizen notified', createdAt: '2026-09-30T08:30:00' }] },
]

export const citizenActionResponses: CitizenActionResponse[] = [
  { actionId: 'action-299', citizenReportId: 'CF-2026-1029', response: 'Conflict', reason: 'Local event', alternativeDate: '2026-10-02', alternativeTimeWindow: '1:00 PM – 3:00 PM', note: 'There is a local event from 10–11 AM.', createdAt: '2026-09-30T09:00:00' },
]

export const citizenNotifications: CitizenNotification[] = [
  { id: 'notice-91', citizenReportId: 'CF-2026-1042', actionId: 'action-301', type: 'Schedule', title: 'A field visit has been confirmed', message: 'A field visit is confirmed for October 1, 9:00 AM – 12:00 PM. Schedules may change.', createdAt: '2026-09-26T12:02:00', read: false },
  { id: 'notice-92', citizenReportId: 'CF-2026-1029', actionId: 'action-299', type: 'Schedule', title: 'An expected field visit is planned', message: 'An officer is expected to inspect the Juniper Street lane on October 2, 10:00 AM – 12:00 PM. This window is not guaranteed.', createdAt: '2026-09-30T08:30:00', read: false },
  { id: 'notice-88', citizenReportId: 'CF-2026-1039', type: 'Preparation', title: 'Collection visit proposed', message: 'A sanitation visit is proposed for Market Road. Timing is not yet confirmed.', createdAt: '2026-09-25T15:10:00', read: false },
  { id: 'notice-82', citizenReportId: 'CF-2026-1027', type: 'Status update', title: 'Streetlight issue marked resolved', message: 'A maintenance visit was recorded for Willow Park. You can report a continuing outage if needed.', createdAt: '2026-09-25T09:00:00', read: true },
]