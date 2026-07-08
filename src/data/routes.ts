import { RouteDistance } from '../types/fuel'

export function getDistanceBand(distanceMile: number): string {
  if (distanceMile < 500) return '500 mile 미만'
  if (distanceMile < 1000) return '500~1,000 mile'
  if (distanceMile < 1500) return '1,000~1,500 mile'
  if (distanceMile < 2000) return '1,500~2,000 mile'
  if (distanceMile < 2500) return '2,000~2,500 mile'
  if (distanceMile < 3000) return '2,500~3,000 mile'
  if (distanceMile < 3500) return '3,000~3,500 mile'
  if (distanceMile < 4000) return '3,500~4,000 mile'
  if (distanceMile < 5000) return '4,000~5,000 mile'
  return '5,000 mile 이상'
}

const routeData: RouteDistance[] = [
  { originCode: 'ICN', originName: '인천', destinationCode: 'NRT', destinationName: '도쿄 나리타', city: '도쿄', country: '일본', distanceKm: 1260, distanceMile: 783, distanceBandLabel: getDistanceBand(783), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'HND', destinationName: '도쿄 하네다', city: '도쿄', country: '일본', distanceKm: 1166, distanceMile: 725, distanceBandLabel: getDistanceBand(725), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'KIX', destinationName: '오사카 간사이', city: '오사카', country: '일본', distanceKm: 1286, distanceMile: 799, distanceBandLabel: getDistanceBand(799), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'FUK', destinationName: '후쿠오카', city: '후쿠오카', country: '일본', distanceKm: 1065, distanceMile: 662, distanceBandLabel: getDistanceBand(662), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'CTS', destinationName: '삿포로 치토세', city: '삿포로', country: '일본', distanceKm: 1201, distanceMile: 747, distanceBandLabel: getDistanceBand(747), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'OKA', destinationName: '오키나와', city: '오키나와', country: '일본', distanceKm: 1448, distanceMile: 900, distanceBandLabel: getDistanceBand(900), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'NGO', destinationName: '나고야', city: '나고야', country: '일본', distanceKm: 1094, distanceMile: 680, distanceBandLabel: getDistanceBand(680), source: 'MOLIT_ROUTE_DISTANCE' },

  { originCode: 'ICN', originName: '인천', destinationCode: 'PEK', destinationName: '베이징', city: '베이징', country: '중국', distanceKm: 1713, distanceMile: 1064, distanceBandLabel: getDistanceBand(1064), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'PVG', destinationName: '상하이 푸동', city: '상하이', country: '중국', distanceKm: 1420, distanceMile: 882, distanceBandLabel: getDistanceBand(882), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'SHA', destinationName: '상하이 홍차오', city: '상하이', country: '중국', distanceKm: 1413, distanceMile: 878, distanceBandLabel: getDistanceBand(878), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'TAO', destinationName: '칭다오', city: '칭다오', country: '중국', distanceKm: 850, distanceMile: 528, distanceBandLabel: getDistanceBand(528), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'CAN', destinationName: '광저우', city: '광저우', country: '중국', distanceKm: 2089, distanceMile: 1298, distanceBandLabel: getDistanceBand(1298), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'HKG', destinationName: '홍콩', city: '홍콩', country: '홍콩', distanceKm: 2032, distanceMile: 1263, distanceBandLabel: getDistanceBand(1263), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'TPE', destinationName: '타이페이', city: '타이페이', country: '대만', distanceKm: 1304, distanceMile: 810, distanceBandLabel: getDistanceBand(810), source: 'MOLIT_ROUTE_DISTANCE' },

  { originCode: 'ICN', originName: '인천', destinationCode: 'BKK', destinationName: '방콕 수완나품', city: '방콕', country: '태국', distanceKm: 3052, distanceMile: 1897, distanceBandLabel: getDistanceBand(1897), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'DMK', destinationName: '방콕 돈므앙', city: '방콕', country: '태국', distanceKm: 2934, distanceMile: 1823, distanceBandLabel: getDistanceBand(1823), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'SIN', destinationName: '싱가포르', city: '싱가포르', country: '싱가포르', distanceKm: 5344, distanceMile: 3322, distanceBandLabel: getDistanceBand(3322), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'KUL', destinationName: '쿠알라룸푸르', city: '쿠알라룸푸르', country: '말레이시아', distanceKm: 5086, distanceMile: 3162, distanceBandLabel: getDistanceBand(3162), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'DAD', destinationName: '다낭', city: '다낭', country: '베트남', distanceKm: 2115, distanceMile: 1314, distanceBandLabel: getDistanceBand(1314), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'HAN', destinationName: '하노이', city: '하노이', country: '베트남', distanceKm: 2173, distanceMile: 1350, distanceBandLabel: getDistanceBand(1350), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'SGN', destinationName: '호치민', city: '호치민', country: '베트남', distanceKm: 3010, distanceMile: 1871, distanceBandLabel: getDistanceBand(1871), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'MNL', destinationName: '마닐라', city: '마닐라', country: '필리핀', distanceKm: 2278, distanceMile: 1415, distanceBandLabel: getDistanceBand(1415), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'CEB', destinationName: '세부', city: '세부', country: '필리핀', distanceKm: 1877, distanceMile: 1166, distanceBandLabel: getDistanceBand(1166), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'DPS', destinationName: '발리', city: '덴파사르', country: '인도네시아', distanceKm: 5846, distanceMile: 3633, distanceBandLabel: getDistanceBand(3633), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'HKT', destinationName: '푸켓', city: '푸켓', country: '태국', distanceKm: 4392, distanceMile: 2729, distanceBandLabel: getDistanceBand(2729), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'BKI', destinationName: '코타키나발루', city: '코타키나발루', country: '말레이시아', distanceKm: 2283, distanceMile: 1420, distanceBandLabel: getDistanceBand(1420), source: 'MOLIT_ROUTE_DISTANCE' },

  { originCode: 'ICN', originName: '인천', destinationCode: 'GUM', destinationName: '괌', city: '괌', country: '괌/사이판', distanceKm: 2141, distanceMile: 1331, distanceBandLabel: getDistanceBand(1331), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'SPN', destinationName: '사이판', city: '사이판', country: '괌/사이판', distanceKm: 2644, distanceMile: 1643, distanceBandLabel: getDistanceBand(1643), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'SYD', destinationName: '시드니', city: '시드니', country: '호주', distanceKm: 4862, distanceMile: 3020, distanceBandLabel: getDistanceBand(3020), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'MEL', destinationName: '멜버른', city: '멜버른', country: '호주', distanceKm: 5409, distanceMile: 3363, distanceBandLabel: getDistanceBand(3363), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'AKL', destinationName: '오클랜드', city: '오클랜드', country: '뉴질랜드', distanceKm: 5636, distanceMile: 3500, distanceBandLabel: getDistanceBand(3500), source: 'MOLIT_ROUTE_DISTANCE' },

  { originCode: 'ICN', originName: '인천', destinationCode: 'LAX', destinationName: '로스앤젤레스', city: '로스앤젤레스', country: '미국', distanceKm: 5415, distanceMile: 3366, distanceBandLabel: getDistanceBand(3366), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'JFK', destinationName: '뉴욕', city: '뉴욕', country: '미국', distanceKm: 6426, distanceMile: 3993, distanceBandLabel: getDistanceBand(3993), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'SFO', destinationName: '샌프란시스코', city: '샌프란시스코', country: '미국', distanceKm: 5096, distanceMile: 3166, distanceBandLabel: getDistanceBand(3166), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'SEA', destinationName: '시애틀', city: '시애틀', country: '미국', distanceKm: 4796, distanceMile: 2979, distanceBandLabel: getDistanceBand(2979), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'YVR', destinationName: '밴쿠버', city: '밴쿠버', country: '캐나다', distanceKm: 4504, distanceMile: 2798, distanceBandLabel: getDistanceBand(2798), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'YYZ', destinationName: '토론토', city: '토론토', country: '캐나다', distanceKm: 6590, distanceMile: 4096, distanceBandLabel: getDistanceBand(4096), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'HNL', destinationName: '호놀룰루', city: '호놀룰루', country: '미국', distanceKm: 3850, distanceMile: 2392, distanceBandLabel: getDistanceBand(2392), source: 'MOLIT_ROUTE_DISTANCE' },

  { originCode: 'ICN', originName: '인천', destinationCode: 'CDG', destinationName: '파리', city: '파리', country: '프랑스', distanceKm: 5762, distanceMile: 3580, distanceBandLabel: getDistanceBand(3580), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'LHR', destinationName: '런던 히드로', city: '런던', country: '영국', distanceKm: 5740, distanceMile: 3567, distanceBandLabel: getDistanceBand(3567), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'FRA', destinationName: '프랑크푸르트', city: '프랑크푸르트', country: '독일', distanceKm: 5830, distanceMile: 3623, distanceBandLabel: getDistanceBand(3623), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'AMS', destinationName: '암스테르담', city: '암스테르담', country: '네덜란드', distanceKm: 5735, distanceMile: 3563, distanceBandLabel: getDistanceBand(3563), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'FCO', destinationName: '로마', city: '로마', country: '이탈리아', distanceKm: 6170, distanceMile: 3835, distanceBandLabel: getDistanceBand(3835), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'BCN', destinationName: '바르셀로나', city: '바르셀로나', country: '스페인', distanceKm: 5990, distanceMile: 3722, distanceBandLabel: getDistanceBand(3722), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'IST', destinationName: '이스탄불', city: '이스탄불', country: '튀르키예', distanceKm: 5515, distanceMile: 3427, distanceBandLabel: getDistanceBand(3427), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'DXB', destinationName: '두바이', city: '두바이', country: '아랍에미리트', distanceKm: 4150, distanceMile: 2579, distanceBandLabel: getDistanceBand(2579), source: 'MOLIT_ROUTE_DISTANCE' },
  { originCode: 'ICN', originName: '인천', destinationCode: 'DOH', destinationName: '도하', city: '도하', country: '카타르', distanceKm: 4470, distanceMile: 2776, distanceBandLabel: getDistanceBand(2776), source: 'MOLIT_ROUTE_DISTANCE' },
]

export const routes = routeData
export const routeCountries = Array.from(new Set(routeData.map(route => route.country))).sort()
export const defaultRoute = routeData.find(route => route.country === '일본') ?? routeData[0]
