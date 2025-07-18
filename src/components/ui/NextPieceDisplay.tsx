import React from 'react'

interface NextPieceDisplayProps {
  nextPiece?: string
  className?: string
}

const pieceColors = {
  I: 'bg-cyan-500',
  O: 'bg-yellow-500',
  T: 'bg-purple-500',
  S: 'bg-green-500',
  Z: 'bg-red-500',
  J: 'bg-blue-500',
  L: 'bg-orange-500',
}

const pieceShapes = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
}

export default function NextPieceDisplay({ nextPiece, className = '' }: NextPieceDisplayProps) {
  const renderPiece = (piece: string) => {
    const shape = pieceShapes[piece as keyof typeof pieceShapes]
    const color = pieceColors[piece as keyof typeof pieceColors]
    
    return (
      <div className="flex flex-col items-center justify-center space-y-1">
        {shape.map((row, rowIndex) => (
          <div key={rowIndex} className="flex space-x-1">
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={`w-4 h-4 rounded-sm border border-gray-600 ${
                  cell ? color : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 ${className}`}>
      <h3 className="text-lg font-bold text-white mb-4">次のピース</h3>
      
      <div className="flex justify-center">
        {nextPiece ? (
          renderPiece(nextPiece)
        ) : (
          <div className="text-gray-500 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-xs">?</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}