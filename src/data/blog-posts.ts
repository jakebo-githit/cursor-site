// 博客文章元数据配置
// 每次添加新文章时，需要在这里添加对应的元数据
// 同时在 src/blog-posts/ 目录下创建对应的 .md 文件

export interface BlogPost {
  id: string;           // 文章唯一标识（对应 .md 文件名）
  title: string;        // 中文标题
  titleEn: string;      // 英文标题
  excerpt: string;      // 中文摘要
  excerptEn: string;    // 英文摘要
  seoTitle?: string;    // SEO标题（可选）
  seoDescription?: string; // SEO描述（可选）
  date: string;         // 发布日期 (YYYY-MM-DD)
  category: string;     // 中文分类
  categoryEn: string;   // 英文分类
  imageUrl?: string;    // 图片URL（可选）
  author?: string;      // 作者（可选）
}

export const blogPosts: BlogPost[] = [
  {
    id: '20260405-胆囊炎发作时什么姿势能缓解疼痛医生详解正确体位-6ro4i6',
    title: '胆囊炎发作时什么姿势能缓解疼痛？医生详解正确体位',
    titleEn: 'What Posture Helps Relieve Pain During a Cholecystitis Attack?',
    excerpt: '胆囊炎发作时采取正确姿势可辅助缓解疼痛。建议蜷曲侧卧位或半卧位，避免平躺。但姿势只是辅助，若持续疼痛超6小时或伴发热黄疸需立即就医，切勿仅依赖体位调整。',
    excerptEn: 'During a cholecystitis attack, proper posture can help relieve pain. Curled side-lying or semi-recumbent positions are recommended, while lying flat should be avoided.',
    seoTitle: '胆囊炎发作时什么姿势能缓解疼痛？医生详解正确体位：胆囊炎发作姿势：怎么躺能缓解疼痛？医生图文详解',
    seoDescription: '胆囊炎发作时什么姿势能缓解疼痛？医生详解正确体位，胆囊炎发作时疼痛剧烈，采取正确的胆囊炎发作姿势如屈膝左侧卧位可辅助缓解。本文详解胆囊炎怎么躺舒服、禁忌动作及何时必须就医，点击阅读专家建议。',
    date: '2026-04-05',
    category: '胆囊炎',
    categoryEn: 'Cholecystitis',
    imageUrl: '/images/blog/blog-20260405-胆囊炎发作时什么姿势能缓解疼痛医生详解正确体位-6ro4i6.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260321-保胆取石术后护理要点加速康复的关键指南-7fvbbi',
    title: '保胆取石术后护理要点：加速康复的关键指南',
    titleEn: 'Essential Post-Operative Care After Gallbladder-Preserving Cholecystolithotomy',
    excerpt: '保胆取石术后的科学护理对预防结石复发、促进身体康复至关重要。本文从饮食管理、伤口护理、运动恢复及长期随访四个维度，为您详细解读术后护理要点。',
    excerptEn: 'Proper post-operative care after gallbladder-preserving cholecystolithotomy is crucial for preventing stone recurrence and promoting recovery. This guide covers dietary management, wound care, physical activity, and long-term follow-up strategies.',
    seoTitle: '保胆取石术后护理要点 | 肝胆外科专家指导',
    seoDescription: '详解保胆取石术后护理要点，包括饮食调整、伤口护理、运动恢复及复查随访，帮助患者科学康复，降低结石复发风险。',
    date: '2026-03-21',
    category: '保胆',
    categoryEn: 'Gallbladder Preservation',
    imageUrl: '/images/blog/blog-20260321-保胆取石术后护理要点加速康复的关键指南-7fvbbi.png',
    author: 'AskDrLiu.com'
  },

  {
    id: '20260320-急性胆囊炎的早期识别与紧急处理-x5w0vo',
    title: '急性胆囊炎的早期识别与紧急处理',
    titleEn: 'Early Identification and Emergency Management of Acute Cholecystitis',
    excerpt: '急性胆囊炎是一种常见的胆囊疾病，了解其早期识别与紧急处理至关重要。',
    excerptEn: 'Acute cholecystitis is a common gallbladder condition; understanding its early identification and emergency management is crucial.',
    seoTitle: '急性胆囊炎的早期识别与紧急处理',
    seoDescription: '了解急性胆囊炎的早期识别与紧急处理方法，助您快速应对。',
    date: '2026-03-20',
    category: '胆囊炎',
    categoryEn: 'Cholecystitis',
    imageUrl: '/images/blog/blog-20260320-急性胆囊炎的早期识别与紧急处理-x5w0vo.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260319-胆囊炎反复发作的原因-folgmj',
    title: '胆囊炎反复发作的原因',
    titleEn: 'Causes of Recurrent Cholecystitis',
    excerpt: '胆囊炎反复发作可能由多种原因引起，包括胆囊结石、胆囊功能障碍和饮食习惯等。了解这些原因有助于预防和管理胆囊炎。',
    excerptEn: 'Recurrent cholecystitis can be caused by various factors, including gallstones, gallbladder dysfunction, and dietary habits. Understanding these causes can help in preventing and managing cholecystitis.',
    seoTitle: '胆囊炎反复发作的原因及预防',
    seoDescription: '了解胆囊炎反复发作的原因，包括胆囊结石、胆囊功能障碍和饮食习惯等，以及如何预防和管理胆囊炎。',
    date: '2026-03-19',
    category: '胆囊炎',
    categoryEn: 'Cholecystitis',
    imageUrl: '/images/blog/blog-20260319-胆囊炎反复发作的原因-folgmj.png',
    author: 'AskDrLiu.com'
  },

  {
    id: '20260317-胆囊炎为何反复-w4xvs1',
    title: '胆囊炎反复发作怎么办？原因、饮食与就医时机',
    titleEn: 'Why Does Cholecystitis Keep Recurring?',
    excerpt: '胆囊炎反复发作怎么办？这篇文章从胆结石、饮食刺激、胆汁淤积和复查时机出发，讲清复发原因与应对要点。',
    excerptEn: 'Understanding the underlying causes of recurrent cholecystitis can help with effective prevention and management strategies.',
    seoTitle: '胆囊炎反复发作怎么办？原因、饮食与就医时机',
    seoDescription: '胆囊炎为什么总是反复发作？这篇文章讲清胆囊炎反复发作的原因、胆囊炎饮食怎么调、胆囊炎不能吃什么，以及什么时候必须就医。',
    date: '2026-03-17',
    category: '胆囊炎',
    categoryEn: 'Cholecystitis',
    imageUrl: '/images/blog/blog-20260317-胆囊炎为何反复-w4xvs1-regen.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260316-胆囊结石能自己排出吗-65pvyl',
    title: '胆囊结石能自己排出吗',
    titleEn: 'Can Gallstones Pass on Their Own?',
    excerpt: '胆囊结石能否自行排出？了解风险与科学应对策略，避免盲目尝试排石疗法。',
    excerptEn: 'Can gallstones pass on their own? Learn about the risks and evidence-based approaches to avoid dangerous self-treatment attempts.',
    seoTitle: '胆囊结石能自己排出吗？肝胆外科医生的真实解答',
    seoDescription: '"喝橄榄油能排石"是真的吗？肝胆外科医生从循证角度解释胆囊结石为何几乎不能自行排出，以及拖延的真实风险。',
    date: '2026-03-16',
    category: '胆囊结石',
    categoryEn: 'Gallstones',
    imageUrl: '/images/blog/blog-20260316-胆囊结石能自己排出吗-65pvyl-regen.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260315-胆囊切除后吃什么-术后饮食与营养恢复指南',
    title: '胆囊切除后吃什么？术后饮食、腹泻与营养恢复指南',
    titleEn: 'What to Eat After Gallbladder Removal: Diet, Diarrhea and Recovery',
    excerpt: '胆囊切除后吃什么、要清淡多久、腹泻怎么办？结合较新研究，讲清术后饮食与营养恢复要点。',
    excerptEn: 'A practical guide to post-cholecystectomy diet, diarrhea control, and nutrition recovery based on recent evidence.',
    seoTitle: '胆囊切除后吃什么？术后饮食与营养恢复指南',
    seoDescription: '胆囊切除后饮食怎么安排？这篇文章结合最新研究，讲清术后腹泻、清淡饮食、高脂食物风险和营养恢复重点。',
    date: '2026-03-18',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-Cholecystectomy Nutrition',
    imageUrl: '/images/blog/blog-20260315-胆囊切除后吃什么-术后饮食与营养恢复指南-regen.png',
    author: 'AskDrLiu.com'
  },


  {
    id: '20260315-胆汁酸腹泻胆囊切除后新解-y792un',
    title: '胆汁酸腹泻：胆囊切除后新解',
    titleEn: 'Bile Acid Diarrhea: Understanding Post-Cholecystectomy Issues',
    excerpt: '胆囊切除后持续性腹泻？最新研究揭示胆汁酸腹泻机制与应对策略。',
    excerptEn: 'Persistent diarrhea after gallbladder removal? Latest insights on bile acid diarrhea mechanisms and management approaches.',
    seoTitle: '胆囊切除后腹泻为什么超过3个月还不好？可能是胆汁酸腹泻',
    seoDescription: '胆囊切除后持续腹泻是胆汁酸腹泻吗？本文解析术后胆汁酸紊乱机制、易漏诊原因与饮食调整方法，帮助患者对症应对。',
    date: '2026-03-15',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-Cholecystectomy Nutrition',
    imageUrl: '/images/blog/blog-20260315-胆汁酸腹泻胆囊切除后新解-y792un-regen.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260315-保胆标准与切胆后营养修复-kx9p3m',
    title: '保胆还是切胆？——术前筛选标准与切除后营养修复完全指南',
    titleEn: 'Preserve or Remove? Gallbladder Criteria & Post-Op Nutrition Guide',
    excerpt: '保胆取石并非人人适合，切胆后营养修复也大有学问。一文读懂术前筛选五大标准与术后三大营养问题。',
    excerptEn: 'Not everyone qualifies for gallbladder preservation. Learn the 5 key criteria for POCS candidates and the 3 major nutritional challenges after cholecystectomy.',
    seoTitle: '保胆取石适应症与胆囊切除后营养修复指南 | 刘波医生',
    seoDescription: '刘波医生详解保胆取石五大筛选标准（胆囊壁、结石大小、胆囊功能、MRCP评估），以及切除胆囊后腹泻、脂肪吸收障碍、菌群失调三大营养修复策略，含电子书推荐。',
    date: '2026-03-15',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-Cholecystectomy Nutrition',
    imageUrl: '/images/blog/blog-20260315-保胆标准与切胆后营养修复-kx9p3m-regen.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260314-保胆取石术后恢复指南-9q1ynf',
    title: '保胆取石术后恢复指南',
    titleEn: 'Post-Gallbladder Preservation Stone Removal Recovery Guide',
    excerpt: '保胆取石术后一周恢复时间表，助您科学康复，避免常见误区。',
    excerptEn: 'A comprehensive one-week recovery timeline after gallbladder preservation stone removal, helping patients navigate the healing process with practical advice.',
    seoTitle: '保胆取石术后一周恢复时间表与注意事项',
    seoDescription: '详细解析保胆取石术后一周恢复过程，包括饮食、活动、疼痛管理等关键要点，帮助患者科学康复。',
    date: '2026-03-14',
    category: '保胆',
    categoryEn: 'Gallbladder Preservation',
    imageUrl: '/images/blog/blog-20260314-保胆取石术后恢复指南-9q1ynf-regen.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260313-保胆取石适合人群与注意事项-9atae9',
    title: '保胆取石：适合人群与注意事项',
    titleEn: 'Gallbladder Preservation Surgery: Who Are Suitable Candidates',
    excerpt: '保胆取石手术并非人人适合，了解适应症是成功治疗的关键。',
    excerptEn: 'Gallbladder preservation surgery isn\'t suitable for everyone. Understanding eligibility criteria is crucial for successful treatment.',
    seoTitle: '保胆取石手术适合人群与禁忌症详解',
    seoDescription: '了解保胆取石手术的适应症、禁忌症及术后注意事项，帮助患者做出明智的治疗选择。',
    date: '2026-03-13',
    category: '保胆',
    categoryEn: 'Gallbladder Preservation',
    imageUrl: '/images/blog/blog-20260313-保胆取石适合人群与注意事项-9atae9-regen.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260312-胆囊炎抗生素使用指南-0q8jgm',
    title: '胆囊炎抗生素使用指南',
    titleEn: 'Guide to Antibiotic Use for Gallbladder Inflammation',
    excerpt: '合理使用抗生素是治疗胆囊炎的关键，了解何时用药、如何用药至关重要。',
    excerptEn: 'Understanding the proper use of antibiotics for gallbladder inflammation is crucial for effective treatment.',
    seoTitle: '胆囊炎抗生素治疗指南：合理用药与注意事项',
    seoDescription: '了解胆囊炎抗生素治疗的合理使用方法，包括用药时机、药物选择及注意事项，帮助患者科学应对胆囊炎。',
    date: '2026-03-12',
    category: '胆囊炎',
    categoryEn: 'Cholecystitis',
    imageUrl: '/images/blog/blog-20260312-胆囊炎抗生素使用指南-0q8jgm.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260310-饮食防胆结石-vc22gd',
    title: '饮食防胆结石：科学证据与实用建议',
    titleEn: 'Diet and Gallstones: Evidence-Based Prevention',
    excerpt: '胆结石影响全球10-15%成人，饮食调整可降低30-50%发病风险。本文解析饮食与结石形成机制，提供6项循证建议，涵盖脂肪控制、膳食纤维、规律饮食、维生素C及体重管理。',
    excerptEn: 'Gallstones affect 10-15% of adults globally. Dietary modifications can reduce risk by 30-50%. This article explores mechanisms and provides 6 evidence-based recommendations covering fat quality, fiber intake, meal regularity, vitamin C, and weight management.',
    seoTitle: '科学饮食预防胆囊结石：循证医学指南',
    seoDescription: '了解如何通过调整饮食预防胆囊结石，包括脂肪控制、膳食纤维、规律饮食、维生素C及体重管理的科学建议，附7篇参考文献。',
    date: '2026-03-10',
    category: '胆囊结石',
    categoryEn: 'Gallstones',
    imageUrl: '/images/blog/blog-20260310-饮食防胆结石-vc22gd.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260309-保胆手术后恢复指南-abugyi',
    title: '保胆手术后恢复指南',
    titleEn: 'Recovery Guide After Gallbladder-Preserving Surgery',
    excerpt: '保胆手术保留胆囊功能的同时去除结石，恢复周期较短但需严格术后管理。本文提供详细恢复时间表（1-3天至长期）、实用建议及工作恢复指导，附6篇参考文献。',
    excerptEn: 'Gallbladder-preserving surgery removes stones while retaining function, offering quicker recovery but requiring stringent postoperative care. This guide provides detailed recovery timeline, practical tips, and return-to-work guidance with 6 academic references.',
    seoTitle: '保胆手术后恢复全攻略：时间表与注意事项',
    seoDescription: '保胆手术后恢复时间表（住院期至6周）、饮食调整、伤口护理、复查安排及工作恢复指导，附循证参考文献。',
    date: '2026-03-09',
    category: '保胆',
    categoryEn: 'Gallbladder Preservation',
    imageUrl: '/images/blog/blog-20260309-保胆手术后恢复指南-abugyi.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260308-胆囊切除后腹泻应对-l357rf',
    title: '胆囊切除后腹泻应对',
    titleEn: 'Managing Diarrhea After Gallbladder Removal',
    excerpt: '胆囊切除术后常见腹泻问题，科学饮食助您恢复健康。',
    excerptEn: 'Learn practical strategies to manage diarrhea and indigestion after gallbladder surgery with evidence-based dietary approaches.',
    seoTitle: '胆囊切除后腹泻怎么办？科学饮食指南',
    seoDescription: '胆囊切除术后腹泻与消化不良的应对策略，包括饮食调整、生活习惯改变及何时就医的专业建议。',
    date: '2026-03-08',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-Cholecystectomy Nutrition',
    imageUrl: '/images/blog/blog-20260308-胆囊切除后腹泻应对-l357rf.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260307-保胆术后管理指南-3jocq5',
    title: '保胆术后管理指南',
    titleEn: 'Post-Gallbladder Preservation Surgery Management Guide',
    excerpt: '保胆手术后定期复查与长期管理是预防复发和确保手术效果的关键。',
    excerptEn: 'Regular follow-up and long-term management after gallbladder preservation surgery are crucial for preventing recurrence and ensuring successful outcomes.',
    seoTitle: '保胆手术后复查与长期管理全攻略',
    seoDescription: '了解保胆手术后的复查时间、饮食调整、药物使用及长期管理要点，预防结石复发，确保手术效果。',
    date: '2026-03-07',
    category: '保胆',
    categoryEn: 'Gallbladder Preservation',
    imageUrl: '/images/blog/blog-20260307-保胆术后管理指南-3jocq5.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260306-胆囊结石与胆囊炎-r2v9kq',
    title: '胆囊结石与胆囊炎：保胆决策与术后营养',
    titleEn: 'Gallstones and Cholecystitis: Gallbladder Preservation and Post-op Nutrition',
    excerpt: '聚焦胆囊结石与胆囊炎患者的保胆适应证、手术选择与术后营养管理，帮助患者做出更稳妥的诊疗决策。',
    excerptEn: 'A practical guide to gallstones and cholecystitis covering gallbladder preservation, surgery selection, and post-op nutrition for patient-centered decisions.',
    seoTitle: '胆囊结石与胆囊炎怎么选？保胆与术后营养要点',
    seoDescription: '围绕胆囊结石与胆囊炎，系统梳理保胆适应证、手术时机与胆囊切除后1-3个月饮食管理及就医警示信号。',
    date: '2026-03-06',
    category: '胆囊结石',
    categoryEn: 'Gallstones',
    imageUrl: '/images/blog/blog-20260306-胆囊结石与胆囊炎-2.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260305-蔬果农药与胆囊健康-olrmws',
    title: '蔬果农药与胆囊健康',
    titleEn: 'Pesticides in Produce and Gallbladder Health',
    excerpt: '研究显示常吃高农药残留蔬果可能影响胆道健康，如何平衡营养与安全。',
    excerptEn: 'Research links high-pesticide produce to potential gallbladder issues, balancing nutrition with safety.',
    seoTitle: '常吃蔬果却有胆囊问题？农药残留与胆道健康的关联解析',
    seoDescription: '研究显示高农药残留蔬果摄入可能增加胆道炎症风险。这篇文章帮你识别高风险品类、正确清洗减少暴露，让营养与安全兼得。',
    date: '2026-03-05',
    category: '胆囊健康',
    categoryEn: 'Gallbladder Health',
    imageUrl: '/images/blog/blog-20260305-蔬果农药与胆囊健康-olrmws.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '肝硬化能逆转警惕钼元素疗法陷阱-1je8c',
    title: '肝硬化能逆转？警惕”钼元素”疗法陷阱',
    titleEn: 'Can Liver Cirrhosis Be Reversed? Beware of “Molybdenum” Therapy Traps',
    excerpt: '肝硬化真的能逆转？刘波主任带你看清”钼元素”疗法的真相 文/肝胆外科专家 刘波主任 在我的门诊里，经常能遇到一脸焦虑的肝硬化患者。他们手里拿着厚厚的检查单，眼神中透着同一个疑问：”刘主任，肝硬化真的治不好吗？我在网上看到',
    excerptEn: 'Can liver cirrhosis truly be reversed? Dr. Liu Bo exposes the truth behind “molybdenum therapy” claims — a common but misleading treatment marketed to cirrhosis patients in China.',
    seoTitle: '肝硬化能逆转？警惕”钼元素”疗法陷阱',
    seoDescription: '肝硬化能逆转吗？本文基于循证医学，解析网络热传”钼元素疗法”的常见误区，以及肝硬化患者真正应该做什么。',
    date: '2026-03-09',
    category: '肝脏健康',
    categoryEn: 'Liver Health',
    imageUrl: '/images/blog/blog-肝硬化能逆转警惕钼元素疗法陷阱-1je8c.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '2026-03-04-cholecystectomy-diet',
    title: '切了胆囊，为什么吃点油还是难受？',
    titleEn: 'Why Does Eating Fat Still Hurt After Gallbladder Removal?',
    excerpt: '胆囊切除后仍然对油腻食物不耐受？肝胆外科医生从医学角度解析原因，并提供有文献依据的饮食建议。',
    excerptEn: 'Still struggling with fatty foods after cholecystectomy? A hepatobiliary surgeon explains the mechanism and offers evidence-based dietary advice.',
    seoTitle: '切了胆囊，为什么吃点油还是难受？',
    seoDescription: '胆囊切除后饮食怎么调？从机制、食物选择到就医指征，一文讲清术后油腻不适的应对方法。',
    date: '2026-03-04',
    category: '胆囊健康',
    categoryEn: 'Gallbladder Health',
    imageUrl: '/images/blog/blog-cholecystectomy-diet-cover.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: 'gallstone-prevention',
    title: '胆结石形成的原因及预防措施',
    titleEn: 'Causes of Gallstone Formation and Preventive Measures',
    excerpt: '胆结石是常见的消化系统疾病，其形成与胆固醇代谢异常、胆汁淤滞和感染等因素密切相关。了解其形成机制并采取有效的预防措施，可以显著降低患病风险。',
    excerptEn: 'Gallstones are a common digestive system disease related to cholesterol metabolism, bile stagnation, and infection. Understanding the formation mechanisms and implementing effective prevention methods can significantly reduce your risk.',
    seoTitle: '为什么会长胆结石？肝胆外科医生解析成因与预防',
    seoDescription: '哪类人最容易长胆结石？本文解析胆固醇结石形成机制，并提供5个经循证医学验证、可降低30-50%风险的实用预防建议。',
    date: '2025-03-15',
    category: '胆结石预防',
    categoryEn: 'Gallstone Prevention',
    imageUrl: '/images/blog/blog-gallstone-prevention.png',
    author: 'AskDrLiu.com'
  },
  {
    id: 'dietary-guidance',
    title: 'POCS手术前后的饮食指导',
    titleEn: 'Dietary Guidance Before and After POCS Surgery',
    excerpt: '胆囊结石经过POCS（经口胆道镜）手术治疗后，合理的饮食指导对患者康复至关重要。手术后的饮食调整不仅能帮助伤口愈合，还能减轻消化系统负担，预防结石复发。',
    excerptEn: 'After treating gallstones with POCS (Peroral Cholangioscopy) surgery, proper dietary guidance is crucial for patient recovery. Post-surgical dietary adjustments not only help wound healing but also reduce the burden on the digestive system.',
    seoTitle: 'POCS保胆手术前后怎么吃？分阶段饮食康复指南',
    seoDescription: 'POCS保胆取石手术前后该怎么吃？从术前轻食、术后流质到恢复均衡饮食，肝胆外科医生给出分阶段实用饮食指南。',
    date: '2025-02-22',
    category: '饮食指导',
    categoryEn: 'Dietary Guidance',
    imageUrl: '/images/blog/blog-dietary-guidance.png',
    author: 'AskDrLiu.com'
  },
  {
    id: 'liver-health',
    title: '肝胆健康的自我监测方法',
    titleEn: 'Self-monitoring Methods for Hepatobiliary Health',
    excerpt: '肝胆问题早期识别对治疗效果至关重要。通过观察皮肤、眼睛颜色变化、消化状况及定期体检，可及早发现肝胆异常信号。',
    excerptEn: 'Early recognition of hepatobiliary problems is crucial. By observing skin and eye color changes, digestive symptoms, and regular checkups, abnormal signals can be detected early.',
    seoTitle: '肝胆健康的自我监测方法',
    seoDescription: '从日常症状观察到体检节奏，整理一套可执行的肝胆健康自我监测清单。',
    date: '2025-01-30',
    category: '肝胆健康',
    categoryEn: 'Hepatobiliary Health',
    imageUrl: '/images/blog/blog-liver-health.png',
    author: 'AskDrLiu.com'
  },
  {
    id: 'recovery-guide',
    title: '术后康复指南：如何加速恢复',
    titleEn: 'Post-operative Rehabilitation Guide: How to Accelerate Recovery',
    excerpt: 'POCS手术具有微创优势，但术后康复仍需科学指导。本文介绍活动强度调整、饮食管理、并发症观察和心理调适，帮助患者更稳地恢复。',
    excerptEn: 'POCS surgery is minimally invasive, but post-operative recovery still needs a structured plan. This guide covers activity progression, diet management, warning signs, and mental adjustment.',
    seoTitle: '术后康复指南：如何加速恢复',
    seoDescription: '覆盖术后活动、饮食与复查节奏的实用康复指南，帮助患者减少并发症并平稳恢复。',
    date: '2025-01-10',
    category: '术后护理',
    categoryEn: 'Post-operative Care',
    imageUrl: '/images/blog/blog-recovery-guide.png',
    author: 'AskDrLiu.com'
  },
  {
    id: 'pocs-vs-traditional',
    title: 'POCS技术与传统手术的对比',
    titleEn: 'Comparison between POCS Technology and Traditional Surgery',
    excerpt: 'POCS技术作为一种先进的微创治疗手段，相比传统开腹手术有哪些优势？本文从创伤程度、恢复时间、并发症风险等方面进行详细对比分析。',
    excerptEn: 'As an advanced minimally invasive treatment method, what advantages does POCS technology have compared to traditional open surgery? This article provides a detailed comparative analysis in terms of trauma degree, recovery time, and complication risk.',
    seoTitle: 'POCS保胆取石 vs 传统切胆手术：该怎么选？',
    seoDescription: '保胆取石还是直接切胆？肝胆外科医生对比POCS与传统手术的创伤程度、恢复时间与并发症风险，帮助患者做出清醒决策。',
    date: '2025-01-05',
    category: '技术介绍',
    categoryEn: 'Technology Introduction',
    imageUrl: '/images/blog/blog-pocs-vs-traditional.png',
    author: 'AskDrLiu.com'
  }
];

// 获取所有分类
export const blogCategories = (isEnglish: boolean): string[] => {
  const categorySet = new Set<string>();
  blogPosts.forEach(post => {
    categorySet.add(isEnglish ? post.categoryEn : post.category);
  });
  return Array.from(categorySet);
};

// 根据ID获取文章
export const getBlogPostById = (id: string): BlogPost | undefined => {
  return blogPosts.find(post => post.id === id);
};

// 根据分类过滤文章
export const getBlogPostsByCategory = (category: string, isEnglish: boolean): BlogPost[] => {
  return blogPosts.filter(post => {
    return isEnglish ? post.categoryEn === category : post.category === category;
  });
};

// 搜索文章
export const searchBlogPosts = (query: string, isEnglish: boolean): BlogPost[] => {
  const lowerQuery = query.toLowerCase();
  return blogPosts.filter(post => {
    const title = isEnglish ? post.titleEn.toLowerCase() : post.title.toLowerCase();
    const excerpt = isEnglish ? post.excerptEn.toLowerCase() : post.excerpt.toLowerCase();
    const category = isEnglish ? post.categoryEn.toLowerCase() : post.category.toLowerCase();
    return title.includes(lowerQuery) ||
           excerpt.includes(lowerQuery) ||
           category.includes(lowerQuery);
  });
};
