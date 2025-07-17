// Supabase连接测试脚本
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase环境变量未设置')
  console.log('请检查.env文件中的以下变量:')
  console.log('- VITE_SUPABASE_URL')
  console.log('- VITE_SUPABASE_ANON_KEY')
} else {
  console.log('✅ Supabase环境变量已设置')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // 测试连接
  supabase.from('profiles').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase连接失败:', error)
      } else {
        console.log('✅ Supabase连接成功')
      }
    })
    .catch(err => {
      console.error('❌ Supabase连接异常:', err)
    })
}
