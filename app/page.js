'use client';

import React, { useState, useEffect } from 'react';
import styles from './Scheduler.module.css';

export default function Scheduler() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    description: '',
    category: 'work'
  });

  // 샘플 데이터
  useEffect(() => {
    const sampleEvents = [
      {
        id: 1,
        title: '팀 회의',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        description: '주간 팀 미팅',
        category: 'work'
      },
      {
        id: 2,
        title: '점심 약속',
        date: new Date().toISOString().split('T')[0],
        time: '12:30',
        description: '친구와 점심',
        category: 'personal'
      }
    ];
    setEvents(sampleEvents);
  }, []);

  const handleSubmit = () => {
    if (!formData.title || !formData.date || !formData.time) {
      alert('제목, 날짜, 시간은 필수 입력 항목입니다.');
      return;
    }
    
    if (editingEvent) {
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...formData, id: editingEvent.id }
          : event
      ));
    } else {
      const newEvent = {
        ...formData,
        id: Date.now()
      };
      setEvents([...events, newEvent]);
    }
    
    resetForm();
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

  const handleDelete = (id) => {
    setEvents(events.filter(event => event.id !== id));
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
            <button
              onClick={() => setShowModal(true)}
              className={styles.addButton}
            >
              ➕
              새 일정 추가
            </button>
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
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
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
                >
                  ❌
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    일정 제목
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={styles.formInput}
                    placeholder="일정 제목을 입력하세요"
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      날짜
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      시간
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className={styles.formInput}
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
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={styles.submitButton}
                  >
                    💾
                    {editingEvent ? '수정하기' : '추가하기'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={styles.cancelButton}
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