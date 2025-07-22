// app/api/events/route.js
//변경 테스트
// 메모리에 임시로 저장할 이벤트 데이터 
let events = [
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
  },
  {
    id: 3,
    title: '운동',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    description: '헬스장 가기',
    category: 'health'
  }
];

// GET: 모든 이벤트 조회
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    // 특정 날짜로 필터링
    if (date) {
      const filteredEvents = events.filter(event => event.date === date);
      return Response.json({ 
        success: true, 
        data: filteredEvents,
        message: `${date} 날짜의 일정을 조회했습니다.`
      });
    }
    
    // 모든 이벤트 반환
    return Response.json({ 
      success: true, 
      data: events,
      message: '모든 일정을 조회했습니다.'
    });
  } catch (error) {
    return Response.json(
      { success: false, message: '일정 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새 이벤트 추가
export async function POST(request) {
  try {
    const body = await request.json();
    
    // 필수 필드 검증
    if (!body.title || !body.date || !body.time) {
      return Response.json(
        { success: false, message: '제목, 날짜, 시간은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    const newEvent = {
      id: Date.now(), // 간단한 ID 생성
      title: body.title,
      date: body.date,
      time: body.time,
      description: body.description || '',
      category: body.category || 'other'
    };
    
    events.push(newEvent);
    
    return Response.json({
      success: true,
      data: newEvent,
      message: '새 일정이 추가되었습니다.'
    }, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, message: '일정 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 이벤트 전체 업데이트
export async function PUT(request) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return Response.json(
        { success: false, message: '수정할 일정의 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const eventIndex = events.findIndex(event => event.id === body.id);
    
    if (eventIndex === -1) {
      return Response.json(
        { success: false, message: '해당 일정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    events[eventIndex] = { ...events[eventIndex], ...body };
    
    return Response.json({
      success: true,
      data: events[eventIndex],
      message: '일정이 수정되었습니다.'
    });
  } catch (error) {
    return Response.json(
      { success: false, message: '일정 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 이벤트 삭제
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    
    if (!id) {
      return Response.json(
        { success: false, message: '삭제할 일정의 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const eventIndex = events.findIndex(event => event.id === id);
    
    if (eventIndex === -1) {
      return Response.json(
        { success: false, message: '해당 일정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    const deletedEvent = events.splice(eventIndex, 1)[0];
    
    return Response.json({
      success: true,
      data: deletedEvent,
      message: '일정이 삭제되었습니다.'
    });
  } catch (error) {
    return Response.json(
      { success: false, message: '일정 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}