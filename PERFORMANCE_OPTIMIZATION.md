# Performance Optimization Plan

## 🚨 **Vấn đề hiện tại:**

### 1. **React Re-render Loops**
- useEffect dependencies không ổn định
- State updates gây cascade re-renders
- Event listeners không được cleanup

### 2. **Memory Leaks**
- Audio elements không được dispose
- Event listeners tích tụ
- Timeout/Interval không được clear

### 3. **Database Performance**
- N+1 query problems
- Không sử dụng pagination hiệu quả
- Realtime subscriptions quá nhiều

## 🔧 **Giải pháp:**

### Phase 1: React Performance
1. **Memoization**
   ```typescript
   const memoizedCallback = useCallback(() => {
     // stable callback
   }, [stableDeps]);
   
   const memoizedValue = useMemo(() => {
     return expensiveCalculation(data);
   }, [data]);
   ```

2. **Cleanup Effects**
   ```typescript
   useEffect(() => {
     const cleanup = () => {
       // cleanup logic
     };
     return cleanup;
   }, []);
   ```

### Phase 2: Audio Optimization
1. **Audio Resource Management**
   ```typescript
   useEffect(() => {
     return () => {
       if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current.src = '';
         audioRef.current.load();
       }
     };
   }, []);
   ```

2. **Event Listener Cleanup**
   ```typescript
   useEffect(() => {
     const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
     audio.addEventListener('timeupdate', handleTimeUpdate);
     
     return () => {
       audio.removeEventListener('timeupdate', handleTimeUpdate);
     };
   }, []);
   ```

### Phase 3: Database Optimization
1. **Batch Queries**
   ```sql
   -- Instead of N+1 queries
   SELECT p.*, 
          json_agg(c.*) as chapters
   FROM products p
   LEFT JOIN chapters c ON p.id = c.product_id
   GROUP BY p.id;
   ```

2. **Pagination với cursor**
   ```typescript
   const { data, error } = await supabase
     .from('products')
     .select('*')
     .gt('id', lastId)
     .limit(20);
   ```

### Phase 4: Caching Strategy
1. **React Query/SWR**
   ```typescript
   const { data, error } = useSWR(
     `/api/products?page=${page}`,
     fetcher,
     { revalidateOnFocus: false }
   );
   ```

2. **Browser Caching**
   ```typescript
   // Cache API responses
   const cache = new Map();
   ```

## 📊 **Priority Actions:**

### High Priority (Fix ngay):
1. Fix useEffect dependencies trong UserManagement
2. Cleanup audio event listeners
3. Add error boundaries
4. Implement proper loading states

### Medium Priority (Tuần tới):
1. Optimize database queries
2. Add memoization cho expensive operations
3. Implement virtual scrolling cho large lists
4. Add service worker cho caching

### Low Priority (Tháng tới):
1. Code splitting
2. Bundle optimization
3. CDN optimization
4. Performance monitoring

## 🎯 **Expected Results:**
- Giảm 70% memory usage
- Tăng 50% page load speed  
- Loại bỏ hoàn toàn hiện tượng treo
- Cải thiện UX đáng kể
