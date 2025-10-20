import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Paper, 
  List, 
  ListItem, 
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
  Typography,
  Box,
  Chip
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import api from '../api'
import { UI_MESSAGES, SUCCESS_TEMPLATES, ERROR_TEMPLATES, formatMessage } from '../config/messages'

export default function SearchBox({ onResultSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef()
  const navigate = useNavigate()

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timeoutId = setTimeout(() => {
      searchServices(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchServices = async (searchQuery) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await api.get(`/api/services?search=${encodeURIComponent(searchQuery)}`)
      setResults(response.data.slice(0, 5)) // Limit to 5 results
      setIsOpen(true)
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectResult = (service) => {
    setQuery('')
    setIsOpen(false)
    if (onResultSelect) {
      onResultSelect(service)
    } else {
      navigate(`/service/${service._id}`)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setIsOpen(false)
      // Navigate to search results page or filter current page
      navigate(`/?search=${encodeURIComponent(query)}`)
    }
  }

  return (
    <Box ref={searchRef} sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          size="small"
          fullWidth
          placeholder="Tìm kiếm dịch vụ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          }}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
      </form>

      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            maxHeight: 400,
            overflowY: 'auto',
            zIndex: 1300,
          }}
        >
          {loading ? (
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <CircularProgress size={24} />
              <Typography color="text.secondary">Đang tìm kiếm...</Typography>
            </Box>
          ) : results.length > 0 ? (
            <>
              <List sx={{ p: 0 }}>
                {results.map((service) => (
                  <ListItem
                    key={service._id}
                    button
                    onClick={() => handleSelectResult(service)}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {service.images && service.images[0] && (
                      <ListItemAvatar>
                        <Avatar 
                          src={service.images[0]} 
                          alt={service.name}
                          variant="rounded"
                        />
                      </ListItemAvatar>
                    )}
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={500}>
                          {service.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          {service.worker && (
                            <Typography variant="body2" color="text.secondary" component="div">
                              Thợ: {service.worker.name}
                            </Typography>
                          )}
                          <Typography variant="body2" color="primary" fontWeight={600} component="div" sx={{ mt: 0.5 }}>
                            {(service.effectivePrice ?? service.basePrice)?.toLocaleString('vi-VN')} VNĐ
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              {query && (
                <ListItem
                  button
                  onClick={() => navigate(`/?search=${encodeURIComponent(query)}`)}
                  sx={{
                    borderTop: 1,
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                    justifyContent: 'center',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <Typography variant="body2" color="primary" fontWeight={500}>
                    Xem tất cả kết quả cho "{query}"
                  </Typography>
                </ListItem>
              )}
            </>
          ) : query && !loading ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                Không tìm thấy dịch vụ nào cho "{query}"
              </Typography>
              <Box sx={{ p: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Gợi ý tìm kiếm:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['sửa máy lạnh', 'sửa máy giặt', 'sửa tủ lạnh', 'điện gia dụng', 'sửa xe máy'].map(suggestion => (
                    <Chip
                      key={suggestion}
                      label={suggestion}
                      size="small"
                      onClick={() => {
                        setQuery(suggestion)
                        setIsOpen(false)
                        navigate(`/?search=${encodeURIComponent(suggestion)}`)
                      }}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          ) : null}
        </Paper>
      )}
    </Box>
  )
}