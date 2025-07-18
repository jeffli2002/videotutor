/**
 * 三角形面积拉窗帘原理 - 专业数学教学脚本
 * 每页视频对应的专业数学教师解说词
 */

const triangleCurtainScript = {
  title: "三角形面积拉窗帘原理专业教学脚本",
  question: "请用动画帮我解释三角形面积的拉窗帘原理",
  
  // 完整脚本内容，按动画阶段匹配
  script: [
    {
      scene: "开场引入",
      page: 1,
      duration: 8,
      visual: "标题页显示：三角形面积的拉窗帘原理",
      teacherScript: {
        zh: "同学们，今天我们要用动画来理解一个美丽的几何原理。想象一下，一个三角形就像一块精心折叠的窗帘，当我们慢慢拉开它时，会发现什么数学奥秘呢？",
        en: "Students, today we'll explore a beautiful geometric principle through animation. Imagine a triangle as a carefully folded curtain - what mathematical secrets are revealed as we slowly draw it open?"
      },
      keyPoints: ["建立窗帘类比", "激发学习兴趣", "设置悬念"]
    },
    {
      scene: "问题提出",
      page: 2,
      duration: 12,
      visual: "显示一个锐角三角形ABC，标注底边和高",
      teacherScript: {
        zh: "这是一个普通的三角形ABC，底边长为b，高为h。我们的问题是：如何求出它的面积？传统公式我们知道是底乘高除以二，但是今天我们要用'拉窗帘'的方法，从几何变换的角度来理解这个公式。",
        en: "Here we have a triangle ABC with base b and height h. Our question is: how do we find its area? We know the traditional formula is base times height divided by two, but today we'll use the 'curtain-pulling' method to understand this formula from a geometric transformation perspective."
      },
      keyPoints: ["明确定义底和高", "提出核心问题", "预告方法论"]
    },
    {
      scene: "窗帘类比建立",
      page: 3,
      duration: 15,
      visual: "三角形逐渐变成折叠窗帘的形状",
      teacherScript: {
        zh: "看这个三角形，我们可以把它想象成一块折叠的窗帘。窗帘的顶端就是顶点A，窗帘的底部就是边BC。当我们拉开窗帘时，整个窗帘会展开成一个长方形。这个展开的过程，就是我们要研究的几何变换。",
        en: "Look at this triangle - we can imagine it as a folded curtain. The top of the curtain is vertex A, and the bottom is side BC. When we draw the curtain open, the entire curtain unfolds into a rectangle. This unfolding process is the geometric transformation we'll study."
      },
      keyPoints: ["建立视觉关联", "解释折叠概念", "预告变换方向"]
    },
    {
      scene: "中线分割",
      page: 4,
      duration: 18,
      visual: "绘制三角形的中线AD，D为BC中点",
      teacherScript: {
        zh: "现在，我们要进行关键的一步。连接顶点A到BC边的中点D，这条线段AD就是三角形的中线。中线将三角形分成两个面积相等的小三角形，这为我们后续的变换奠定了基础。观察点D的位置，它精确地将BC分成两段相等的部分。",
        en: "Now for the crucial step. Connect vertex A to point D, the midpoint of side BC. This segment AD is the median of the triangle. The median divides the triangle into two smaller triangles of equal area, laying the foundation for our upcoming transformation. Notice how point D precisely divides BC into two equal segments."
      },
      keyPoints: ["中线定义", "面积等分原理", "中点几何意义"]
    },
    {
      scene: "剪切动作",
      page: 5,
      duration: 20,
      visual: "沿中线AD剪切三角形，分成三角形ABD和ADC",
      teacherScript: {
        zh: "沿着中线AD，我们将整个三角形像纸张一样剪开。现在，我们得到了两个面积相等的小三角形：左边的三角形ABD和右边的三角形ADC。每个小三角形的面积都是原三角形面积的一半。注意，剪切不会改变总面积，这是面积守恒的体现。",
        en: "Along median AD, we cut the entire triangle as if it were paper. Now we have two smaller triangles of equal area: triangle ABD on the left and triangle ADC on the right. Each small triangle has half the area of the original triangle. Notice that cutting doesn't change the total area - this demonstrates area conservation."
      },
      keyPoints: ["剪切操作", "面积守恒", "几何分割"]
    },
    {
      scene: "平移变换",
      page: 6,
      duration: 25,
      visual: "右侧三角形ADC旋转180度并平移",
      teacherScript: {
        zh: "现在是最精彩的时刻！让我们把右边的三角形ADC旋转180度，然后向右上方平移。看！它完美地填在了三角形ABD的右侧。这个旋转和平移的变换，就像把窗帘的一侧拉到另一侧，形成了一个完整的长方形。",
        en: "Here's the most exciting moment! Let's rotate triangle ADC 180 degrees and translate it upwards to the right. Watch! It perfectly fills the space to the right of triangle ABD. This rotation and translation is like pulling one side of the curtain to the other side, forming a complete rectangle."
      },
      keyPoints: ["旋转变换", "平移操作", "形状重组"]
    },
    {
      scene: "矩形形成",
      page: 7,
      duration: 22,
      visual: "两个三角形拼接成长方形，标注尺寸",
      teacherScript: {
        zh: "看！通过刚才的变换，我们成功地将三角形ABC转化为了一个长方形。这个长方形的长就是三角形的底b，宽就是三角形的高h。更重要的是，这个长方形的面积恰好是原三角形面积的两倍！这就是几何变换的魔力所在。",
        en: "Look! Through our transformation, we've successfully converted triangle ABC into a rectangle. The length of this rectangle is the triangle's base b, and the width is the triangle's height h. More importantly, the rectangle's area is exactly twice the area of the original triangle! This is the magic of geometric transformation."
      },
      keyPoints: ["矩形形成", "尺寸对应", "面积关系"]
    },
    {
      scene: "面积计算",
      page: 8,
      duration: 18,
      visual: "计算长方形面积，显示公式",
      teacherScript: {
        zh: "既然长方形的面积等于长乘以宽，也就是b乘以h，而我们原来的三角形面积就是这个长方形面积的一半。因此，三角形的面积就是b×h÷2。这就是著名的三角形面积公式，现在我们从几何变换的角度完全理解了它的来源。",
        en: "Since the rectangle's area equals length times width, which is b times h, and our original triangle's area is half of this rectangle's area, the triangle's area is b×h÷2. This is the famous triangle area formula, and now we completely understand its origin from geometric transformation."
      },
      keyPoints: ["公式推导", "面积关系", "原理理解"]
    },
    {
      scene: "普遍验证",
      page: 9,
      duration: 20,
      visual: "展示不同类型三角形的相同变换",
      teacherScript: {
        zh: "让我们验证这个原理的普遍性。无论是锐角三角形、钝角三角形还是直角三角形，我们都可以用同样的'拉窗帘'方法来推导面积公式。每一类型的三角形都能通过中线分割和变换，最终得到相同的面积公式。这证明了我们方法的通用性。",
        en: "Let's verify the universality of this principle. Whether it's an acute triangle, obtuse triangle, or right triangle, we can use the same 'curtain-pulling' method to derive the area formula. Every type of triangle can undergo the same median division and transformation to ultimately yield the same area formula."
      },
      keyPoints: ["普遍性验证", "不同类型三角形", "方法通用性"]
    },
    {
      scene: "总结回顾",
      page: 10,
      duration: 15,
      visual: "总结三角形面积公式和变换过程",
      teacherScript: {
        zh: "今天我们通过'拉窗帘'的生动比喻，从几何变换的角度深入理解了三角形面积公式。这个公式不仅仅是记忆，而是通过美妙的数学变换得出的必然结果。记住：三角形面积等于底乘以高除以二，这个'除以二'来自于我们将三角形变换为长方形时面积的两倍关系。",
        en: "Today, through the vivid metaphor of 'drawing curtains', we deeply understood the triangle area formula from a geometric transformation perspective. This formula isn't just memorization, but an inevitable result derived from beautiful mathematical transformations. Remember: triangle area equals base times height divided by two, and this 'divided by two' comes from the double area relationship when we transform the triangle into a rectangle."
      },
      keyPoints: ["知识总结", "原理理解", "记忆深化"]
    }
  ],
  
  // 技术规格
  technicalSpecs: {
    totalDuration: 195, // 3分15秒
    format: "16:9 1920x1080",
    fps: 30,
    colorScheme: ["#2E86AB", "#A23B72", "#F18F01", "#C73E1D"],
    font: "思源黑体",
    background: "渐变浅蓝"
  },
  
  // 教学重点
  teachingHighlights: [
    "几何变换思想",
    "面积守恒原理", 
    "公式推导过程",
    "数学可视化",
    "普遍适用性"
  ]
}

// 输出完整脚本
console.log("📚 三角形面积拉窗帘原理 - 专业数学教学脚本")
console.log("=".repeat(70))

console.log(`\n🎯 教学主题: ${triangleCurtainScript.title}`)
console.log(`问题: ${triangleCurtainScript.question}`)
console.log(`总时长: ${triangleCurtainScript.technicalSpecs.totalDuration}秒`)

console.log(`\n🎬 分阶段脚本:`)
triangleCurtainScript.script.forEach((scene, index) => {
  console.log(`\n${index + 1}. ${scene.scene} (${scene.duration}s)`)
  console.log(`   视觉: ${scene.visual}`)
  console.log(`   脚本: ${scene.teacherScript.zh}`)
  console.log(`   重点: ${scene.keyPoints.join(", ")}`)
})

console.log(`\n📊 技术规格:`)
console.log(`   分辨率: ${triangleCurtainScript.technicalSpecs.format}`)
console.log(`   帧率: ${triangleCurtainScript.technicalSpecs.fps}fps`)
console.log(`   配色: ${triangleCurtainScript.technicalSpecs.colorScheme.join(", ")}`)

console.log(`\n🎯 教学重点:`)
triangleCurtainScript.teachingHighlights.forEach(highlight => console.log(`   • ${highlight}`))

console.log("\n" + "=".repeat(70))
console.log("🎓 专业数学教师脚本已生成，可直接用于视频制作！")