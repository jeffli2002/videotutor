// 测试 Supabase 连接
import { supabase } from './src/config/supabase.js'

async function testSupabaseConnection() {
  console.log('🔍 测试 Supabase 连接...')
  
  try {
    // 测试基本连接
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase 连接失败:', error)
      return false
    }
    
    console.log('✅ Supabase 连接成功')
    console.log('📊 查询结果:', data)
    return true
    
  } catch (error) {
    console.error('❌ Supabase 测试异常:', error)
    return false
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  testSupabaseConnection()
}

export { testSupabaseConnection } 