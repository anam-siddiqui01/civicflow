interface MatchInput {
  description: string
  category: string
  location: string
  ward: number | null
}

const parkingTerms = /\b(parking|parked|vehicles?|lane obstruction|blocked lane|traffic)\b|गाड़ियां|गाड़ियाँ|गाड़ी|गाड़ियां|गाड्या|उभ्या|केल्यामुळे|अडतो|रास्ता बंद|रस्ता अड/u
const garbageTerms = /\b(garbage|waste|bins?)\b|कचरा|कूड़ा|कचरा|कचर/u
const waterTerms = /\b(water|supply|pressure)\b|पानी|जल|पाणी|पुरवठा/u
const roadTerms = /\b(road|pothole|pavement)\b|सड़क|सड़क|रस्ता|खड्डा|गड्ढा/u
const lightingTerms = /\b(streetlights?|street lamps?|electricity outage)\b|स्ट्रीट लाइट|बत्ती|दिवे|वीज/u

function resolveWard(description: string, location: string, ward: number | null): number | null {
  const statedWard = `${location} ${description}`.match(/\bward\s*(\d+)\b/i)?.[1]
  return ward ?? (statedWard ? Number(statedWard) : null)
}

export function normalizeIssueType(description: string, category: string, location: string): string {
  const text = `${description} ${category} ${location}`
  if (parkingTerms.test(text)) return 'lane obstruction'
  if (garbageTerms.test(text)) return 'waste accumulation'
  if (waterTerms.test(text)) return 'water supply disruption'
  if (roadTerms.test(text)) return 'road damage'
  if (lightingTerms.test(text)) return 'streetlight outage'
  return 'other civic issue'
}

export function matchIssueCluster({ description, category, location, ward }: MatchInput): string | null {
  const normalizedCategory = category.toLowerCase()
  const searchableText = `${description} ${location}`
  const reportWard = resolveWard(description, location, ward)
  const communityLocation = /community\s*cent(?:er|re)|कम्युनिटी\s*सेंटर|समुदाय केंद्र/i.test(searchableText)

  const parkingRelated = normalizedCategory === 'parking / traffic' || parkingTerms.test(searchableText)
  if (parkingRelated && (reportWard === null || reportWard === 8) && (reportWard === 8 || communityLocation || normalizedCategory === 'parking / traffic')) return 'issue-parking-8'
  if ((normalizedCategory === 'garbage' || garbageTerms.test(searchableText)) && (reportWard === null || reportWard === 7)) return 'issue-garbage-7'
  if ((normalizedCategory.includes('water') || waterTerms.test(searchableText)) && (reportWard === null || reportWard === 12)) return 'issue-water-12'
  if ((normalizedCategory === 'roads' || roadTerms.test(searchableText)) && (reportWard === null || reportWard === 4)) return 'issue-road-4'
  if ((normalizedCategory === 'electricity' || normalizedCategory === 'streetlights' || lightingTerms.test(searchableText)) && (reportWard === null || reportWard === 3)) return 'issue-lights-3'

  return null
}