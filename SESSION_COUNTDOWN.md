# ⏰ Session Countdown - Đếm ngược phiên đăng nhập Zalo

## 🎯 Tính năng mới

**Vấn đề:** Zalo web chỉ duy trì trạng thái đăng nhập trong **14 ngày**. Sau đó user phải đăng nhập lại, nhưng không biết khi nào sẽ hết hạn.

**Giải pháp:** Thêm **đếm ngược 14 ngày** từ lần quét nhóm thành công cuối cùng, hiển thị ngay dưới thông tin cache.

---

## ✨ Demo

### Trước khi có tính năng:
```
┌─────────────────────────────────────────┐
│ Có 94 nhóm đã lưu (4 phút trước)       │
│ - Tự động hiển thị                      │
│                                         │
│                      [Quét lại]        │
└─────────────────────────────────────────┘
```

### Sau khi có tính năng:
```
┌─────────────────────────────────────────┐
│ Có 94 nhóm đã lưu (4 phút trước)       │
│ - Tự động hiển thị                      │
│ 🕒 Còn 12 ngày để đăng nhập lại        │
│                                         │
│                      [Quét lại]        │
└─────────────────────────────────────────┘
```

---

## 🔧 Implementation

### 1. **Session Tracking**

Mỗi khi quét nhóm thành công → Lưu timestamp:

```javascript
function updateSessionExpiry(nick) {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)); // +14 days
  
  sessionData[nick] = {
    lastSuccessfulScan: now.toISOString(),
    sessionExpiry: expiryDate.toISOString()
  };
  
  localStorage.setItem('zaloSessionExpiry', JSON.stringify(sessionData));
}
```

### 2. **Countdown Calculation**

```javascript
function getSessionExpiry(nick) {
  const now = new Date();
  const expiryDate = new Date(sessionData[nick].sessionExpiry);
  
  const timeLeft = expiryDate - now;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
  
  return {
    daysLeft,
    hoursLeft,
    isExpired: timeLeft <= 0,
    isExpiringSoon: daysLeft <= 2 // Warning when < 2 days
  };
}
```

### 3. **Smart Display**

```javascript
function formatCountdown(sessionInfo) {
  if (sessionInfo.isExpired) {
    return '⚠️ Phiên đăng nhập đã hết hạn - Cần đăng nhập lại';
  }
  
  if (sessionInfo.daysLeft > 1) {
    return `🕒 Còn ${sessionInfo.daysLeft} ngày để đăng nhập lại`;
  } else if (sessionInfo.hoursLeft > 1) {
    return `⏰ Còn ${sessionInfo.hoursLeft} giờ để đăng nhập lại`;
  } else {
    return '🚨 Sắp hết hạn - Nên đăng nhập lại ngay';
  }
}
```

### 4. **Real-time Updates**

Timer cập nhật mỗi phút:
```javascript
setInterval(updateAllCountdowns, 60000); // Update every minute
```

---

## 📊 Các trạng thái hiển thị

| Thời gian còn lại | Icon | Màu sắc | Message |
|-------------------|------|---------|---------|
| > 2 ngày | 🕒 | Xanh | "Còn X ngày để đăng nhập lại" |
| 1-2 ngày | ⏰ | Vàng | "Còn X giờ để đăng nhập lại" |
| < 1 giờ | 🚨 | Đỏ | "Sắp hết hạn - Nên đăng nhập lại ngay" |
| Đã hết hạn | ⚠️ | Đỏ | "Phiên đăng nhập đã hết hạn - Cần đăng nhập lại" |

---

## 🧪 Test Scenarios

### Test 1: Nick mới (chưa quét bao giờ)
```
1. Chọn nick mới chưa từng quét
2. ✅ Kỳ vọng: Không hiển thị countdown (chưa có session data)
```

### Test 2: Nick vừa quét thành công
```
1. Quét nhóm thành công với nick "Khánh Duy"
2. ✅ Kỳ vọng: "🕒 Còn 14 ngày để đăng nhập lại"
```

### Test 3: Nick đã quét 10 ngày trước
```
1. Simulate: Set lastSuccessfulScan = 10 days ago
2. ✅ Kỳ vọng: "🕒 Còn 4 ngày để đăng nhập lại"
```

### Test 4: Nick sắp hết hạn (< 2 ngày)
```
1. Simulate: Set lastSuccessfulScan = 13 days ago
2. ✅ Kỳ vọng: "⏰ Còn 24 giờ để đăng nhập lại"
```

### Test 5: Nick đã hết hạn
```
1. Simulate: Set lastSuccessfulScan = 15 days ago
2. ✅ Kỳ vọng: "⚠️ Phiên đăng nhập đã hết hạn - Cần đăng nhập lại"
```

### Test 6: Real-time update
```
1. Để app chạy 2-3 phút
2. ✅ Kỳ vọng: Countdown tự động cập nhật mỗi phút
```

---

## 💾 Data Storage

### localStorage Structure:

```javascript
// Key: 'zaloSessionExpiry'
{
  "Khánh Duy": {
    "lastSuccessfulScan": "2024-10-17T10:30:00.000Z",
    "sessionExpiry": "2024-10-31T10:30:00.000Z"
  },
  "LINH ND": {
    "lastSuccessfulScan": "2024-10-15T14:20:00.000Z", 
    "sessionExpiry": "2024-10-29T14:20:00.000Z"
  }
}
```

### View data trong console:
```javascript
// View all session data
JSON.parse(localStorage.getItem('zaloSessionExpiry') || '{}')

// Check specific nick
const sessionData = JSON.parse(localStorage.getItem('zaloSessionExpiry') || '{}');
console.log('Khánh Duy session:', sessionData['Khánh Duy']);
```

---

## 🔄 Integration với existing features

### 1. **Cache Display Integration**

Countdown hiển thị ngay dưới cache info:

```javascript
function updateCacheDisplay(featureNum, nick) {
  // ... existing cache logic ...
  
  // Add countdown
  const sessionInfo = getSessionExpiry(nick);
  const countdownText = sessionInfo ? formatCountdown(sessionInfo) : '';
  
  let displayText = `Có ${cacheInfo.groupCount} nhóm đã lưu (${timeText}) - Tự động hiển thị`;
  if (countdownText) {
    displayText += `\n${countdownText}`;
  }
  
  cacheTextElement.innerHTML = displayText.replace('\n', '<br><small class="text-xs opacity-75">') + '</small>';
}
```

### 2. **Auto-update on Success**

Mỗi khi `setGroupCache()` được gọi → Tự động update session expiry:

```javascript
function setGroupCache(nick, groups) {
  // ... save cache logic ...
  
  // Update session expiry tracking
  updateSessionExpiry(nick);
}
```

### 3. **Multi-feature Support**

Countdown hiển thị trên cả 3 features:
- ✅ Feature 1: Gửi tin nhắn
- ✅ Feature 2: Đăng bài tự động  
- ✅ Feature 3: Mời thành viên

---

## 🎨 UI/UX Design

### Visual Hierarchy:
```
┌─────────────────────────────────────────┐
│ Có 94 nhóm đã lưu (4 phút trước)       │ ← Primary info (larger)
│ - Tự động hiển thị                      │
│ 🕒 Còn 12 ngày để đăng nhập lại        │ ← Secondary info (smaller, muted)
│                                         │
│                      [Quét lại]        │
└─────────────────────────────────────────┘
```

### CSS Classes:
- Primary text: `text-sm text-gray-700`
- Countdown text: `text-xs opacity-75` (smaller, muted)
- Warning states: Color changes based on urgency

### Icons:
- 🕒 Normal (> 2 days): Neutral
- ⏰ Warning (1-2 days): Yellow/Orange
- 🚨 Urgent (< 1 day): Red
- ⚠️ Expired: Red

---

## 📈 Benefits

### For Users:
- ✅ **Proactive notification** - Biết trước khi nào cần đăng nhập lại
- ✅ **Prevent downtime** - Không bị bất ngờ khi session hết hạn
- ✅ **Better planning** - Có thể plan việc đăng nhập lại
- ✅ **Reduce frustration** - Không phải đoán khi nào hết hạn

### For Developers:
- ✅ **Reduce support tickets** - User tự biết khi nào cần action
- ✅ **Better UX** - Proactive vs reactive approach
- ✅ **Data insights** - Track session patterns
- ✅ **Easy maintenance** - Self-contained feature

---

## 🔧 Configuration

### Constants:
```javascript
const SESSION_DURATION_DAYS = 14; // Zalo web session duration
const UPDATE_INTERVAL_MS = 60000; // Update every minute
```

### Customization:
```javascript
// Change warning threshold (default: 2 days)
isExpiringSoon: daysLeft <= 2

// Change update frequency (default: 1 minute)
setInterval(updateAllCountdowns, 60000);

// Change session duration (default: 14 days)
const SESSION_DURATION_DAYS = 14;
```

---

## 🚀 Future Enhancements

### Phase 1: Basic (Current) ✅
- [x] Track session expiry per nick
- [x] Display countdown in cache UI
- [x] Real-time updates every minute
- [x] Smart formatting based on time left

### Phase 2: Advanced (Future)
- [ ] Push notifications when < 1 day left
- [ ] Email reminders for critical nicks
- [ ] Bulk session management
- [ ] Session analytics dashboard

### Phase 3: Intelligence (Future)
- [ ] Predict optimal re-login times
- [ ] Auto-detect session expiry from API errors
- [ ] Smart scheduling around session expiry
- [ ] Integration with calendar apps

---

## 🐛 Troubleshooting

### Issue: Countdown không hiển thị
**Cause:** Nick chưa từng quét thành công
**Solution:** Quét nhóm ít nhất 1 lần để tạo session data

### Issue: Countdown không update
**Cause:** Timer không chạy hoặc elements không tồn tại
**Solution:** Check console errors, verify elements exist

### Issue: Thời gian không chính xác
**Cause:** System clock sai hoặc timezone issues
**Solution:** Sync system time, check timezone settings

### Issue: Data bị mất
**Cause:** localStorage cleared hoặc browser issues
**Solution:** Re-scan groups để tạo lại session data

---

## 📝 Files Modified

### `index.html`

**Lines 1748-1750: Constants**
```javascript
const SESSION_EXPIRY_KEY = 'zaloSessionExpiry';
const SESSION_DURATION_DAYS = 14;
```

**Lines 1785-1787: Integration**
```javascript
function setGroupCache(nick, groups) {
  // ... existing logic ...
  updateSessionExpiry(nick); // ← New line
}
```

**Lines 1830-1928: New Functions**
- `updateSessionExpiry(nick)` - Update session data
- `getSessionExpiry(nick)` - Get countdown info
- `formatCountdown(sessionInfo)` - Format display text
- `updateAllCountdowns()` - Update all visible countdowns

**Lines 1930-1960: Enhanced Display**
```javascript
function updateCacheDisplay(featureNum, nick) {
  // ... existing cache logic ...
  
  // Add countdown
  const sessionInfo = getSessionExpiry(nick);
  const countdownText = sessionInfo ? formatCountdown(sessionInfo) : '';
  
  // Combine cache + countdown
  let displayText = `${cacheText}\n${countdownText}`;
  cacheTextElement.innerHTML = displayText.replace('\n', '<br><small>') + '</small>';
}
```

**Lines 4891-4892: Timer**
```javascript
setInterval(updateAllCountdowns, 60000); // Update every minute
```

---

## 💡 Usage Examples

### Example 1: Fresh nick (first scan)
```
Input: Nick "New User" quét nhóm lần đầu
Output: "🕒 Còn 14 ngày để đăng nhập lại"
```

### Example 2: Regular usage
```
Input: Nick "Khánh Duy" đã quét 5 ngày trước
Output: "🕒 Còn 9 ngày để đăng nhập lại"
```

### Example 3: Warning state
```
Input: Nick "LINH ND" đã quét 13 ngày trước
Output: "⏰ Còn 20 giờ để đăng nhập lại"
```

### Example 4: Critical state
```
Input: Nick "Test" đã quét 13 ngày 23 giờ trước
Output: "🚨 Sắp hết hạn - Nên đăng nhập lại ngay"
```

### Example 5: Expired
```
Input: Nick "Old" đã quét 15 ngày trước
Output: "⚠️ Phiên đăng nhập đã hết hạn - Cần đăng nhập lại"
```

---

**Status:** ✅ **IMPLEMENTED & READY**

**Impact:** 🟢 **High** - Significantly improves user experience by providing proactive session management

**Last Updated:** 2024-10-17
