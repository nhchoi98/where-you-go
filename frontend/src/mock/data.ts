import type { User } from '../types/user'
import type { Space, SpaceDetail } from '../types/space'
import type { Task } from '../types/task'
import type { Journal } from '../types/journal'

export const mockUser: User = {
  id: 'user-1',
  email: 'demo@whereyougo.kr',
  name: '김데모',
  avatar_url: null,
}

export const mockSpaces: Space[] = [
  {
    id: 'space-1',
    name: '서울 데이트 코스',
    description: '주말마다 가고 싶은 서울 핫플 모음',
    createdBy: 'user-1',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'space-2',
    name: '제주 여행 계획',
    description: '5월 제주 2박3일 코스 짜기',
    createdBy: 'user-1',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-12T00:00:00Z',
  },
  {
    id: 'space-3',
    name: '맛집 탐방',
    description: null,
    createdBy: 'user-1',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
  },
]

export const mockSpaceDetail: SpaceDetail = {
  space: mockSpaces[0]!,
  members: [
    { id: 'member-1', userId: 'user-1', role: 'owner', joinedAt: '2026-02-01T00:00:00Z', userName: '김데모', userEmail: 'demo@whereyougo.kr' },
    { id: 'member-2', userId: 'user-2', role: 'member', joinedAt: '2026-02-05T00:00:00Z', userName: '이수진', userEmail: 'sujin@example.com' },
    { id: 'member-3', userId: 'user-3', role: 'member', joinedAt: '2026-03-01T00:00:00Z', userName: '박민호', userEmail: 'minho@example.com' },
  ],
}

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    spaceId: 'space-1',
    createdBy: 'user-1',
    title: '성수 카페거리',
    placeName: '성수동',
    priority: 5,
    metadata: {
      entries: [
        { type: 'memo', content: '대림창고 갤러리 꼭 들르기' },
        { type: 'map_link', content: 'https://naver.me/abc123' },
      ],
    },
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'task-2',
    spaceId: 'space-1',
    createdBy: 'user-1',
    title: '북촌 한옥마을',
    placeName: '종로구 북촌',
    priority: 4,
    metadata: {
      entries: [
        { type: 'memo', content: '한복 체험 예약 필수' },
      ],
    },
    createdAt: '2026-03-02T00:00:00Z',
    updatedAt: '2026-03-08T00:00:00Z',
  },
  {
    id: 'task-3',
    spaceId: 'space-1',
    createdBy: 'user-2',
    title: '을지로 노포 투어',
    placeName: '을지로3가',
    priority: 3,
    metadata: { entries: [] },
    createdAt: '2026-03-05T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
  },
  {
    id: 'task-4',
    spaceId: 'space-1',
    createdBy: 'user-1',
    title: '한강 피크닉',
    placeName: '여의도 한강공원',
    priority: 2,
    metadata: {
      entries: [
        { type: 'memo', content: '돗자리, 치킨 준비' },
      ],
    },
    createdAt: '2026-03-07T00:00:00Z',
    updatedAt: '2026-03-07T00:00:00Z',
  },
  {
    id: 'task-5',
    spaceId: 'space-1',
    createdBy: 'user-2',
    title: '이태원 브런치',
    placeName: '이태원',
    priority: 1,
    metadata: { entries: [] },
    createdAt: '2026-03-09T00:00:00Z',
    updatedAt: '2026-03-09T00:00:00Z',
  },
]

export const mockJournals: Journal[] = [
  {
    id: 'journal-1',
    spaceId: 'space-1',
    createdBy: 'user-1',
    title: '성수동 데이트',
    dateFrom: '2026-03-08',
    dateTo: '2026-03-08',
    taskIds: ['task-1'],
    metadata: {
      description: '성수 카페거리에서 하루 종일 돌아다녔다',
      review: '대림창고 갤러리가 생각보다 너무 좋았고, 뚝섬역 근처 디저트 카페도 최고!',
      entries: [],
    },
    createdAt: '2026-03-08T00:00:00Z',
    updatedAt: '2026-03-08T00:00:00Z',
  },
  {
    id: 'journal-2',
    spaceId: 'space-1',
    createdBy: 'user-1',
    title: '북촌 나들이',
    dateFrom: '2026-03-01',
    dateTo: '2026-03-02',
    taskIds: ['task-2', 'task-3'],
    metadata: {
      description: '한옥마을 구경 + 을지로 저녁',
      entries: [],
    },
    createdAt: '2026-03-02T00:00:00Z',
    updatedAt: '2026-03-02T00:00:00Z',
  },
]
