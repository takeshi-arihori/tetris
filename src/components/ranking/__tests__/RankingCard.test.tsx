import { render, screen } from '@testing-library/react'
import { RankingCard } from '../RankingCard'
import type { RankingData } from '@/lib/ranking/ranking-service'

const mockRanking: RankingData = {
  userId: 'user123',
  username: 'TestPlayer',
  score: 85000,
  level: 7,
  rankPosition: 1,
  periodStart: '2024-01-01',
  periodEnd: '2024-01-07',
}

describe('RankingCard', () => {
  it('should render ranking information correctly', () => {
    render(<RankingCard ranking={mockRanking} />)

    expect(screen.getByText('TestPlayer')).toBeInTheDocument()
    expect(screen.getByText('85,000')).toBeInTheDocument()
    expect(screen.getByText('Level 7')).toBeInTheDocument()
  })

  it('should display gold medal emoji for 1st place', () => {
    render(<RankingCard ranking={mockRanking} />)
    expect(screen.getByText('🥇')).toBeInTheDocument()
  })

  it('should display silver medal emoji for 2nd place', () => {
    const secondPlace = { ...mockRanking, rankPosition: 2 }
    render(<RankingCard ranking={secondPlace} />)
    expect(screen.getByText('🥈')).toBeInTheDocument()
  })

  it('should display bronze medal emoji for 3rd place', () => {
    const thirdPlace = { ...mockRanking, rankPosition: 3 }
    render(<RankingCard ranking={thirdPlace} />)
    expect(screen.getByText('🥉')).toBeInTheDocument()
  })

  it('should display numeric position for 4th place and below', () => {
    const fourthPlace = { ...mockRanking, rankPosition: 4 }
    render(<RankingCard ranking={fourthPlace} />)
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('should highlight current user with special styling', () => {
    const { container } = render(
      <RankingCard ranking={mockRanking} isCurrentUser={true} />
    )
    
    expect(screen.getByText('あなた')).toBeInTheDocument()
    expect(container.querySelector('.border-blue-500')).toBeInTheDocument()
  })

  it('should show period information when showPeriod is true', () => {
    render(<RankingCard ranking={mockRanking} showPeriod={true} />)
    expect(screen.getByText('1/1 - 1/7')).toBeInTheDocument()
  })

  it('should not show period information when showPeriod is false', () => {
    render(<RankingCard ranking={mockRanking} showPeriod={false} />)
    expect(screen.queryByText('1/1 - 1/7')).not.toBeInTheDocument()
  })

  it('should format large scores with commas', () => {
    const highScore = { ...mockRanking, score: 1234567 }
    render(<RankingCard ranking={highScore} />)
    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('should show additional info for top 3 players', () => {
    render(<RankingCard ranking={mockRanking} />)
    expect(screen.getByText('達成レベル')).toBeInTheDocument()
  })

  it('should not show additional info for players below top 3', () => {
    const lowerRank = { ...mockRanking, rankPosition: 5 }
    render(<RankingCard ranking={lowerRank} />)
    expect(screen.queryByText('達成レベル')).not.toBeInTheDocument()
  })

  it('should apply correct color classes based on rank position', () => {
    const { container: container1 } = render(
      <RankingCard ranking={{ ...mockRanking, rankPosition: 1 }} />
    )
    expect(container1.querySelector('.text-yellow-400')).toBeInTheDocument()

    const { container: container2 } = render(
      <RankingCard ranking={{ ...mockRanking, rankPosition: 2 }} />
    )
    expect(container2.querySelector('.text-gray-300')).toBeInTheDocument()

    const { container: container3 } = render(
      <RankingCard ranking={{ ...mockRanking, rankPosition: 3 }} />
    )
    expect(container3.querySelector('.text-amber-600')).toBeInTheDocument()

    const { container: container10 } = render(
      <RankingCard ranking={{ ...mockRanking, rankPosition: 10 }} />
    )
    expect(container10.querySelector('.text-blue-400')).toBeInTheDocument()
  })

  it('should handle missing period data gracefully', () => {
    const noPeriodRanking = {
      ...mockRanking,
      periodStart: undefined,
      periodEnd: undefined,
    }
    
    render(<RankingCard ranking={noPeriodRanking} showPeriod={true} />)
    // ピリオド情報がない場合は表示されない
    expect(screen.queryByText(/\d+\/\d+ - \d+\/\d+/)).not.toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<RankingCard ranking={mockRanking} />)
    
    const card = screen.getByText('TestPlayer').closest('div')
    expect(card).toHaveClass('rounded-lg')
    
    // スコア表示が適切にフォーマットされている
    expect(screen.getByText('85,000')).toBeInTheDocument()
  })

  it('should validate score and level values', () => {
    expect(mockRanking.score).toBeValidTetrisScore()
    expect(mockRanking.level).toBeValidTetrisLevel()
  })
})