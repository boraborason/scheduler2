'use client';

import React, { useState, useEffect } from 'react';
import styles from './Scheduler.module.css';

export default function Scheduler() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    description: '',
    category: 'work'
  });

  // API에서 이벤트 데이터 불러오기
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.data);
      } else {
        console.error('이벤트 불러오기 실패:', result.message);
        alert('일정을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      alert('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      alert('제목, 날짜, 시간은 필수 입력 항목입니다.');
      return;
    }
    
    try {
      setLoading(true);
      
      if (editingEvent) {
        // 수정 API 호출
        const response = await fetch('/api/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingEvent.id })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setEvents(events.map(event => 
            event.id === editingEvent.id ? result.data : event
          ));
          alert('일정이 수정되었습니다.');
        } else {
          alert(result.message || '일정 수정에 실패했습니다.');
        }
      } else {
        // 추가 API 호출
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          setEvents([...events, result.data]);
          alert('새 일정이 추가되었습니다.');
        } else {
          alert(result.message || '일정 추가에 실패했습니다.');
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('API 호출 오류:', error);
      alert('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      description: '',
      category: 'work'
    });
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData(event);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setEvents(events.filter(event => event.id !== id));
        alert('일정이 삭제되었습니다.');
      } else {
        alert(result.message || '일정 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      alert('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => event.date === currentDate);
  const sortedEvents = filteredEvents.sort((a, b) => a.time.localeCompare(b.time));

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? '오후' : '오전';
    const displayHour = hour % 12 || 12;
    return `${ampm} ${displayHour}:${minutes}`;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      work: '업무',
      personal: '개인',
      health: '건강',
      other: '기타'
    };
    return labels[category] || '기타';
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* 로딩 표시 */}
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}>⏳ 처리 중...</div>
          </div>
        )}

        {/* 헤더 */}
        <div className={styles.header}>
          <h1 className={styles.title}>일정 관리</h1>
          <p className={styles.subtitle}>효율적으로 스케줄을 관리해보세요</p>
        </div>

        {/* 컨트롤 패널 */}
        <div className={styles.controlPanel}>
          <div className={styles.controlFlex}>
            <div className={styles.dateWrapper}>
              <span className={styles.dateIcon}>📅</span>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                onClick={fetchEvents}
                className={styles.refreshButton}
                disabled={loading}
              >
                🔄 새로고침
              </button>
              <button
                onClick={() => setShowModal(true)}
                className={styles.addButton}
                disabled={loading}
              >
                ➕ 새 일정 추가
              </button>
            </div>
          </div>
        </div>

        {/* 선택된 날짜 표시 */}
        <div className={styles.dateDisplay}>
          <h2 className={styles.currentDate}>{formatDate(currentDate)}</h2>
        </div>

        {/* 이벤트 컨테이너 */}
        <div className={styles.eventsContainer}>
          {sortedEvents.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📅</div>
              <p className={styles.emptyText}>이 날짜에 등록된 일정이 없습니다.</p>
              <p className={styles.emptySubtext}>새 일정을 추가해보세요!</p>
            </div>
          ) : (
            <div className={styles.eventsList}>
              {sortedEvents.map(event => (
                <div
                  key={event.id}
                  className={`${styles.eventCard} ${styles[event.category]}`}
                >
                  <div className={styles.eventContent}>
                    <div className={styles.eventInfo}>
                      <div className={styles.eventHeader}>
                        <span>🕐</span>
                        <span className={styles.eventTitle}>{event.title}</span>
                        <span className={styles.eventTime}>
                          {formatTime(event.time)}
                        </span>
                      </div>
                      {event.description && (
                        <p className={styles.eventDescription}>{event.description}</p>
                      )}
                      <div className={styles.eventCategory}>
                        <span className={styles.categoryTag}>
                          {getCategoryLabel(event.category)}
                        </span>
                      </div>
                    </div>
                    <div className={styles.eventActions}>
                      <button
                        onClick={() => handleEdit(event)}
                        className={`${styles.actionButton} ${styles.editButton}`}
                        disabled={loading}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 모달 */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>
                  {editingEvent ? '일정 수정' : '새 일정 추가'}
                </h3>
                <button
                  onClick={resetForm}
                  className={styles.closeButton}
                  disabled={loading}
                >
                  ❌
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    일정 제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={styles.formInput}
                    placeholder="일정 제목을 입력하세요"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      날짜 *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={styles.formInput}
                      disabled={loading}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      시간 *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className={styles.formInput}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    카테고리
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={styles.formInput}
                    disabled={loading}
                  >
                    <option value="work">업무</option>
                    <option value="personal">개인</option>
                    <option value="health">건강</option>
                    <option value="other">기타</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    설명 (선택)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`${styles.formInput} ${styles.formTextarea}`}
                    placeholder="일정에 대한 추가 정보를 입력하세요"
                    rows="3"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={styles.submitButton}
                    disabled={loading}
                  >
                    💾 {loading ? '처리중...' : (editingEvent ? '수정하기' : '추가하기')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={styles.cancelButton}
                    disabled={loading}
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}