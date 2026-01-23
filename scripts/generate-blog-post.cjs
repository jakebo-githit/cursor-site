/**
 * 自动博客文章生成脚本 - 专业版
 *
 * 功能：
 * 1. 根据预设主题生成专业的医学文章
 * 2. 包含研究背景、临床数据、案例、建议等深度内容
 * 3. 生成 Markdown 格式的文章
 * 4. 保存到草稿目录供审核
 *
 * 使用方法：
 * node scripts/generate-blog-post.cjs [主题关键词]
 */

const fs = require('fs');
const path = require('path');

// 专业文章主题配置
const ARTICLE_TEMPLATES = [
  {
    id: 'gallstone-formation',
    topic: '胆结石形成的分子机制与临床意义',
    category: '胆结石预防',
    content: {
      intro: '胆结石是常见的消化系统疾病，全球发病率约为10-15%。近年来，随着分子生物学和影像学技术的发展，对胆结石形成机制的认识不断深入。本文将从分子水平探讨胆结石的形成机制，并分析其在临床诊断和治疗中的意义。',
      background: '胆结石主要由胆固醇、胆色素和钙盐等成分组成。在胆固醇结石中，胆固醇结晶的形成与胆汁中胆固醇过饱和密切相关。研究表明，当胆汁中胆固醇浓度超过其溶解能力时，胆固醇会析出形成微晶，并在胆囊内聚集。此外，载脂蛋白如ABCA1和ABCG5/G8的基因多态性也影响胆固醇代谢，增加结石形成风险。',
      mechanisms: [
        '胆汁成分失衡：胆盐、磷脂和胆固醇比例失调是结石形成的基础',
        '胆固醇过饱和：肝脏分泌的胆固醇过多，或胆囊吸收水分导致胆汁浓缩',
        '成核因子：黏液蛋白、免疫球蛋白等促进胆固醇结晶形成',
        '胆囊动力障碍：胆囊收缩功能减弱，胆汁淤滞，促进晶体聚集'
      ],
      riskFactors: [
        { factor: '年龄>40岁', risk: '风险增加2-3倍' },
        { factor: '女性', risk: '女性发病率是男性的2-4倍' },
        { factor: '肥胖', risk: 'BMI>30时风险显著增加' },
        { factor: '快速减重', risk: '每周减重>1.5kg时风险增加' },
        { factor: '妊娠', risk: '雌激素水平升高促进胆汁淤滞' }
      ],
      prevention: [
        '控制体重在健康范围（BMI 18.5-24.9）',
        '每周进行150分钟中等强度有氧运动',
        '增加膳食纤维摄入（每日25-30克）',
        '减少精制碳水化合物和饱和脂肪',
        '规律进餐，避免长时间禁食',
        '戒烟限酒，保持良好生活习惯'
      ],
      clinicalData: {
        table: [
          ['结石类型', '占比', '主要成分', '超声特征'],
          ['胆固醇结石', '70-80%', '胆固醇', '强回声，声影明显'],
          ['胆色素结石', '15-20%', '胆红素', '回声较弱，多发'],
          ['混合型结石', '5-10%', '胆固醇+胆色素', '回声不均匀']
        ]
      },
      caseStudy: {
        patient: '李女士，45岁',
        history: '右上腹隐痛3个月，B超发现胆囊内多发结石，最大直径1.2cm',
        diagnosis: '经详细检查确诊为胆固醇性胆囊结石，伴轻度胆囊功能减退',
        treatment: '建议POCS取石联合保胆治疗，术后配合药物治疗',
        outcome: '术后1个月复查，胆囊功能恢复良好，患者满意度高'
      }
    }
  },
  {
    id: 'pocs-advantages',
    topic: 'POCS技术的临床优势与适应症',
    category: '技术介绍',
    content: {
      intro: '经口胆道镜（Peroral Cholangioscopy, POCS）技术是胆道疾病诊疗的重要革新。相比传统ERCP，POCS实现了胆道内直视观察，大大提高了诊断的准确性和治疗的有效性。本文系统介绍POCS技术的优势、适应症及临床应用。',
      background: 'POCS技术采用纤细的光纤或电子胆道镜，经口、胃、十二指肠进入胆道系统。最新的SpyGlass DS系统提供高分辨率成像，视野清晰度可达100μm，能够清晰显示胆道黏膜的细微病变，包括微小结石、狭窄、肿瘤等。',
      advantages: [
        { title: '可视化操作', detail: '直视下操作，避免了传统ERCP"盲取"的局限性，降低医源性损伤风险' },
        { title: '精准碎石', detail: '激光或液电碎石在直视下进行，能够精确控制碎石范围，保护胆道黏膜' },
        { title: '保留胆囊', detail: '对于胆总管结石患者，可在保留完整胆囊的情况下完成取石' },
        { title: '适应症广', detail: '适用于复杂胆道结石、肝内胆管结石、术后复发结石等多种情况' },
        { title: '安全性高', detail: '并发症发生率显著低于传统手术，尤其适合高龄、体弱患者' }
      ],
      comparison: {
        table: [
          ['指标', '传统开腹手术', '腹腔镜胆囊切除', 'POCS技术'],
          ['切口数量', '1个大切口', '3-4个小孔', '无体表切口'],
          ['手术时间', '1.5-3小时', '1-2小时', '30分钟-1小时'],
          ['住院天数', '7-14天', '3-5天', '1-3天'],
          ['恢复时间', '4-8周', '2-4周', '3-7天'],
          ['术后疼痛', '重度，需止痛药', '中度', '轻微，很少需止痛药'],
          ['胆囊保留', '否', '否', '是（可选）']
        ]
      },
      indications: [
        '胆总管结石，尤其是直径>1cm或多发结石',
        '肝内胆管结石，传统ERCP难以到达的位置',
        '胆管狭窄，需要直视下评估和扩张',
        '术后复发结石，既往有胆囊切除史',
        '不明原因胆道出血，需要镜下定位',
        '高龄、体弱、无法耐受传统手术的患者'
      ],
      contraindications: [
        '急性胆管炎伴胆道完全梗阻',
        '严重凝血功能障碍',
        '上消化道严重畸形或狭窄',
        '严重心肺功能不全无法耐受内镜操作'
      ],
      successRate: '研究数据显示，POCS技术对胆总管结石的完全清除率达到92-96%，高于传统ERCP的80-85%。并发症发生率<5%，显著低于开腹手术的15-20%。',
      caseStudy: {
        patient: '张先生，68岁',
        history: '既往胆囊切除术后5年，复发胆总管结石，最大直径2.5cm，传统ERCP尝试取石失败',
        diagnosis: '经MRCP确诊为胆总管多发巨大结石，伴局部胆管扩张',
        treatment: '采用POCS技术，使用激光碎石将大结石击碎后分次取出',
        outcome: '手术时长75分钟，完全清除结石，术后2天出院，随访6个月无复发'
      }
    }
  },
  {
    id: 'post-diet',
    topic: 'POCS手术后科学饮食康复方案',
    category: '饮食指导',
    content: {
      intro: 'POCS手术具有创伤小、恢复快的优势，但术后科学的饮食管理对促进康复、预防复发至关重要。本文基于临床营养学研究和大量术后随访数据，系统介绍POCS手术后的分阶段饮食方案。',
      background: 'POCS手术后，胆道系统需要一定时间恢复功能。术后初期，胆汁分泌量和成分发生变化，消化脂肪的能力暂时减弱。因此，饮食调整需要遵循"循序渐进、低脂高蛋白"的原则。',
      phases: [
        {
          name: '术后第1天（禁食期）',
          foods: ['禁食禁水，遵医嘱静脉补液'],
          notes: '观察有无腹痛、发热等并发症征象'
        },
        {
          name: '术后第2天（流质期）',
          foods: ['米汤、藕粉、清粥', '蒸蛋羹（去黄）', '蔬菜汤（去油）'],
          notes: '少量多次，每次100-150ml，每日6-8次',
          avoid: ['牛奶、豆浆等易产气食物', '油腻、高脂食物']
        },
        {
          name: '术后第3-5天（半流质期）',
          foods: ['烂面条、馒头片', '豆腐脑、蒸蛋', '煮烂的蔬菜（菠菜、冬瓜）', '去皮的鱼肉、鸡肉泥'],
          notes: '逐渐增加食量，每餐150-200ml，每日5-6次',
          avoid: ['油炸食品', '动物脂肪（肥肉、奶油）']
        },
        {
          name: '术后第6-14天（软食期）',
          foods: ['软饭、面包', '鱼肉、瘦肉丝（煮透）', '豆腐、豆制品', '新鲜蔬菜水果（熟食）'],
          notes: '恢复三餐规律，每餐七分饱',
          avoid: ['辛辣刺激食物', '生冷食物']
        },
        {
          name: '术后2周后（普食过渡期）',
          foods: ['基本恢复正常饮食', '仍需控制脂肪摄入'],
          notes: '逐渐增加食物种类，观察耐受情况',
          avoid: ['暴饮暴食', '宵夜']
        }
      ],
      nutritionAdvice: [
        { title: '控制总脂肪', detail: '每日脂肪摄入控制在40-50g，选择植物油而非动物油' },
        { title: '优质蛋白', detail: '每日蛋白质60-70g，选择鱼、蛋、豆制品等易消化蛋白' },
        { title: '充足膳食纤维', detail: '每日25-30g，促进肠道蠕动，预防便秘' },
        { title: '维生素补充', detail: '适量补充维生素C、E，促进伤口愈合和抗氧化' },
        { title: '规律进餐', detail: '定时定量，尤其不能省略早餐，促进胆汁规律分泌' },
        { title: '充足饮水', detail: '每日1500-2000ml，稀释胆汁，预防结石复发' }
      ],
      foodsRecommend: {
        good: [
          { food: '燕麦、糙米', reason: '富含膳食纤维，帮助胆汁排泄' },
          { food: '深海鱼（三文鱼、鲭鱼）', reason: '含Omega-3脂肪酸，抗炎' },
          { food: '西兰花、菠菜', reason: '富含维生素和纤维' },
          { food: '核桃、亚麻籽', reason: '含健康脂肪，促进代谢' },
          { food: '苹果、梨', reason: '含果胶，帮助胆汁成分调节' }
        ],
        avoid: [
          { food: '肥肉、动物油脂', reason: '高胆固醇，促进结石形成' },
          { food: '油炸食品、快餐', reason: '高脂肪高热量' },
          { food: '蛋黄、动物内脏', reason: '胆固醇含量极高' },
          { food: '精制糖、甜点', reason: '增加肝脏负担' },
          { food: '酒精饮料', reason: '损伤肝细胞，影响胆汁分泌' }
        ]
      },
      supplements: [
        { name: '熊去氧胆酸', dose: '10-15mg/kg/日，分次服用', note: '适用于胆固醇性结石，需服用6-12个月' },
        { name: '维生素D', dose: '800-1000IU/日', note: '研究显示维D缺乏与结石风险相关' },
        { name: '益生菌', dose: '每日1-2粒', note: '改善肠道菌群，促进胆汁酸代谢' }
      ],
      caseStudy: {
        patient: '王女士，52岁',
        history: 'POCS取石术后，初期饮食不当导致腹胀、腹泻',
        treatment: '接受专业营养师指导，按照分阶段饮食方案执行',
        outcome: '术后2周消化功能完全恢复，体重稳定，随访1年无结石复发'
      }
    }
  },
  {
    id: 'gallbladder-preservation',
    topic: '保胆取石手术的适应症与长期效果',
    category: '技术介绍',
    content: {
      intro: '胆囊切除术曾是治疗胆结石的标准方法，但随着技术的发展，保胆取石成为越来越多患者和医生的选择。保胆手术能否实施，需要综合考虑结石类型、胆囊功能、复发风险等因素。本文深入分析保胆取石的适应症、手术方式及长期疗效。',
      background: '胆囊具有重要的生理功能，包括储存和浓缩胆汁、调节胆汁释放、参与脂质代谢等。研究表明，胆囊切除后可能出现腹胀、腹泻、结肠癌风险增加等远期问题。因此，在条件允许的情况下，保留胆囊具有重要意义。',
      evaluationCriteria: [
        { criterion: '胆囊收缩功能', standard: '脂餐试验或同位素扫描，收缩率≥50%适合保胆' },
        { criterion: '结石类型', standard: '胆固醇性结石适合，胆色素性结石复发风险高' },
        { criterion: '结石大小', standard: '单发或多发但数量有限，一般不超过10枚' },
        { criterion: '胆囊壁厚度', standard: '超声显示胆囊壁<4mm，无严重炎症或钙化' },
        { criterion: '结石嵌顿', standard: '结石无长期嵌顿，胆囊管通畅' }
      ],
      surgicalMethods: [
        { name: '腹腔镜保胆取石', pros: '微创、视野好、恢复快', cons: '仅适用于胆囊内结石' },
        { name: 'POCS保胆取石', pros: '无体表切口、适合胆总管结石、可同时处理', cons: '设备要求高' },
        { name: '小切口保胆取石', pros: '操作直接、费用相对较低', cons: '切口较腹腔镜大' }
      ],
      longTermOutcomes: {
        study1: '一项5年前瞻性研究显示，保胆取石患者的生活质量评分显著优于胆囊切除患者，尤其在消化功能和肠道健康方面。',
        study2: '荟萃分析显示，保胆取石的短期复发率为5-10%，远期（5年）复发率为15-20%。严格选择适应症可降低复发率。',
        study3: '胆囊保留患者的远期结肠癌风险降低30-50%，可能与胆汁持续分泌有关。'
      },
      recurrenceFactors: [
        '胆汁成分异常（代谢性）',
        '胆囊功能不全或收缩差',
        '术后未进行预防性药物治疗',
        '不良生活习惯（高脂饮食、缺乏运动）',
        '遗传因素'
      ],
      prevention: [
        '术后服用熊去氧胆酸6-12个月',
        '低脂低胆固醇饮食长期坚持',
        '定期随访（术后3个月、6个月、1年）',
        '补充维生素D和益生菌',
        '控制体重，避免快速减重'
      ],
      decision: '是否选择保胆取石，需要由经验丰富的专科医生综合评估。刘波主任团队在保胆手术方面有丰富经验，已完成千余例保胆手术，满意度高。',
      caseStudy: {
        patient: '陈先生，38岁',
        history: '右上腹隐痛半年，B超发现胆囊内单发结石，直径1.5cm，胆囊收缩功能良好',
        diagnosis: '符合保胆取石指征，无明显手术禁忌',
        treatment: '采用腹腔镜保胆取石术，完整取出结石，保留胆囊',
        outcome: '术后5天出院，术后1年复查胆囊功能正常，无结石复发，患者对消化功能改善满意'
      }
    }
  },
  {
    id: 'liver-health-monitoring',
    topic: '肝胆健康自我监测与预警信号',
    category: '肝胆健康',
    content: {
      intro: '肝胆疾病早期症状往往不典型，容易被忽视。定期自我监测有助于早期发现问题，及时就医。本文详细介绍肝胆健康的自我监测方法、异常信号识别及定期体检建议。',
      monitoringMethods: [
        {
          name: '皮肤和巩膜观察',
          normal: '肤色均匀，巩膜（眼白）洁白透明',
          abnormal: '皮肤发黄（黄疸）、巩膜黄染，提示胆红素升高',
          urgency: '立即就医，可能是胆道梗阻或肝损伤'
        },
        {
          name: '消化状况评估',
          normal: '食欲正常，无恶心呕吐，排便规律',
          abnormal: '食欲下降、厌油腻、恶心、腹胀、排便颜色变浅',
          urgency: '持续1周以上应检查'
        },
        {
          name: '腹部症状自查',
          normal: '腹部柔软，无压痛，进食后无不适',
          abnormal: '右上腹隐痛或胀痛，进食油腻后加重，可能放射至右肩背',
          urgency: '持续疼痛或急性发作需急诊'
        },
        {
          name: '尿液和粪便观察',
          normal: '尿色淡黄，粪便黄褐色',
          abnormal: '尿色深黄如茶，粪便陶土色（灰白）',
          urgency: '立即就医，提示胆汁排泄异常'
        }
      ],
      warningSignals: [
        { signal: '右上腹不适', description: '隐痛、胀痛，尤其进食后', urgency: '门诊检查' },
        { signal: '发热寒战', description: '可能提示胆管炎或肝脓肿', urgency: '急诊就医' },
        { signal: '严重黄疸', description: '皮肤巩膜明显发黄，尿色深', urgency: '急诊就医' },
        { signal: '剧烈腹痛', description: '右上腹持续剧痛，伴出汗', urgency: '急诊就医' },
        { signal: '意识改变', description: '嗜睡、烦躁或意识模糊', urgency: '急诊就医' }
      ],
      labValues: [
        { item: 'ALT/AST', normal: '<40U/L', significance: '肝细胞损伤指标' },
        { item: 'ALP/GGT', normal: 'ALP<150U/L, GGT<60U/L', significance: '胆道损伤指标' },
        { item: '总胆红素', normal: '3.4-20.5μmol/L', significance: '黄疸相关' },
        { item: 'GGT', normal: '<60U/L', significance: '酒精性肝损伤敏感指标' },
        { item: 'CA19-9', normal: '<37U/mL', significance: '胰腺和胆道肿瘤标志物' }
      ],
      imaging: {
        ultrasound: '首选筛查方法，可发现胆结石、胆囊壁变化、肝实质回声异常，建议每年1次',
        mrcp: '磁共振胆胰管成像，对胆道结石、狭窄、肿瘤的诊断准确率高，适用于复杂病例',
        ct: '增强CT对肝胆肿瘤、胆管扩张的诊断价值高，但辐射剂量较大',
        biopsy: '可疑肿瘤时需组织活检确诊'
      },
      frequency: [
        { group: '健康人群', check: '每年1次体检（含肝胆B超、肝功能）' },
        { group: '有肝胆病史', check: '每6个月1次复查' },
        { group: '有肝癌家族史', check: '每3-6个月1次检查（含AFP、彩超）' },
        { group: '术后患者', check: '术后1个月、3个月、6个月、1年定期复查' }
      ],
      caseStudy: {
        patient: '赵女士，55岁',
        history: '自行监测发现巩膜轻微发黄，伴右上腹不适',
        action: '及时门诊就诊，B超发现胆总管结石伴胆管扩张',
        treatment: '及时POCS取石，黄疸消退',
        outcome: '避免了病情进展到急性梗阻性黄疸或胆管炎，预后良好'
      }
    }
  },
  {
    id: 'nutrition-prevention',
    topic: '基于循证医学的胆结石营养预防策略',
    category: '饮食指导',
    content: {
      intro: '饮食因素在胆结石形成中起重要作用。基于大量流行病学研究和临床试验，科学调整饮食结构可以有效降低胆结石发病风险。本文系统介绍胆结石的营养预防策略，包括饮食成分、营养素补充及生活方式干预。',
      researchData: '大型队列研究显示：膳食纤维摄入量最高组比最低组胆结石风险降低13%；规律早餐者风险降低17%；每周运动>150分钟者风险降低21%。',
      riskFoods: [
        { food: '高胆固醇食物', items: ['动物内脏（肝、脑、肾）', '蛋黄（每天>1个）', '鱼子、蟹黄'], risk: '增加胆汁中胆固醇过饱和风险' },
        { food: '高饱和脂肪', items: ['肥肉、五花肉', '黄油、奶油', '油炸食品', '加工肉类'], risk: '促进胆固醇合成，抑制胆盐分泌' },
        { food: '精制碳水化合物', items: ['白面包、白米', '甜点、含糖饮料'], risk: '增加胰岛素抵抗和肥胖风险' },
        { food: '低纤维饮食', items: ['过度加工食品', '精制谷物'], risk: '降低肠道对胆汁酸的结合排泄' }
      ],
      protectiveFoods: [
        { food: '高纤维食物', items: ['燕麦、糙米、全麦面包', '蔬菜（西兰花、胡萝卜、菠菜）', '水果（苹果、梨、浆果类）'], effect: '纤维与胆汁酸结合，增加排泄，降低胆汁胆固醇浓度' },
        { food: '不饱和脂肪酸', items: ['深海鱼（三文鱼、沙丁鱼）', '坚果（核桃、杏仁）', '橄榄油'], effect: '替代饱和脂肪，降低肝脏胆固醇合成' },
        { food: '植物蛋白', items: ['豆制品', '坚果', '全谷物'], effect: '提供优质蛋白同时含植物甾醇，竞争性抑制胆固醇吸收' },
        { food: '抗氧化食物', items: ['浆果类', '绿茶', '深色蔬菜'], effect: '减少氧化应激和炎症' },
        { food: '维生素D来源', items: ['鱼类', '蛋黄（适量）', '强化食品'], effect: '维D缺乏与结石风险增加相关' }
      ],
      dietaryPattern: {
        breakfast: '必须吃早餐，早餐促进胆囊收缩，排出胆汁，预防淤滞',
        meals: '一日三餐定时定量，避免长时间禁食导致胆汁过度浓缩',
        water: '每日饮水1500-2000ml，稀释胆汁，促进排泄',
        timing: '睡前3小时不进食，减少胆汁夜间滞留'
      },
      supplements: [
        { name: '维生素C', dose: '500-1000mg/日', evidence: '多项研究显示维C降低胆结石风险，可能与促进胆固醇转化为胆汁酸有关' },
        { name: '维生素D', dose: '1000-2000IU/日', evidence: '维D受体基因多态性与结石风险相关，补充维D可降低风险' },
        { name: '钙剂', dose: '800-1200mg/日（饮食钙）', evidence: '适量饮食钙与肠道中胆汁酸结合，减少重吸收，而非直接降低结石风险' },
        { name: '镁', dose: '300-400mg/日', evidence: '镁缺乏与胆结石风险增加相关，可能影响胆囊收缩功能' }
      ],
      weightManagement: {
        bmi: '维持BMI在18.5-24.9之间',
        loss: '减重速度不超过每周0.5-1kg，避免快速减重增加结石风险',
        exercise: '每周150-300分钟中等强度运动，改善代谢和胆囊功能'
      },
      caseStudy: {
        patient: '刘先生，42岁',
        history: '体检发现胆泥沙，有家族史',
        intervention: '调整饮食结构：增加全谷物和蔬菜，减少饱和脂肪，规律早餐，补充维生素C和D',
        outcome: '6个月后复查，胆泥沙消失，体重下降5kg，整体健康状况改善'
      }
    }
  }
];

// 获取今天的日期
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 生成文章ID
function generateArticleId(template) {
  return template.id + '-' + Date.now().toString(36);
}

// 生成完整文章内容
function generateFullArticle(template) {
  const c = template.content;

  let content = `# ${template.topic}

> **${template.category}** • ${getTodayDate()}

---

## 研究背景

${c.intro}

## 机制分析

${c.background}
`;

  // 添加各部分内容
  if (c.mechanisms) {
    content += `\n## 形成机制\n\n`;
    c.mechanisms.forEach((m, i) => {
      content += `**${i + 1}.** ${m}\n\n`;
    });
  }

  if (c.advantages) {
    content += `\n## POCS技术优势\n\n`;
    c.advantages.forEach((a, i) => {
      content += `### ${a.title}\n\n${a.detail}\n\n`;
    });
  }

  if (c.riskFactors) {
    content += `\n## 风险因素\n\n| 危险因素 | 风险水平 |\n|---------|----------|\n`;
    c.riskFactors.forEach(r => {
      content += `| ${r.factor} | ${r.risk} |\n`;
    });
    content += '\n';
  }

  if (c.indications) {
    content += `\n## 适应症\n\n`;
    c.indications.forEach((ind, i) => {
      content += `${i + 1}. ${ind}\n`;
    });
    content += '\n';
  }

  if (c.contraindications) {
    content += `\n## 禁忌症\n\n`;
    c.contraindications.forEach((con, i) => {
      content += `${i + 1}. ${con}\n`;
    });
    content += '\n';
  }

  if (c.prevention) {
    content += `\n## 预防措施\n\n`;
    c.prevention.forEach((p, i) => {
      content += `${i + 1}. ${p}\n`;
    });
    content += '\n';
  }

  if (c.clinicalData && c.clinicalData.table) {
    content += `\n## 临床数据\n\n`;
    c.clinicalData.table.forEach((row, i) => {
      if (i === 0) {
        content += `| ${row.join(' | ')} |\n`;
        content += `| ${row.map(() => '---').join(' | ')} |\n`;
      } else {
        content += `| ${row.join(' | ')} |\n`;
      }
    });
    content += '\n';
  }

  if (c.comparison && c.comparison.table) {
    content += `\n## 与传统方法对比\n\n`;
    c.comparison.table.forEach((row, i) => {
      if (i === 0) {
        content += `| ${row.join(' | ')} |\n`;
        content += `| ${row.map(() => '---').join(' | ')} |\n`;
      } else {
        content += `| ${row.join(' | ')} |\n`;
      }
    });
    content += '\n';
  }

  if (c.phases) {
    content += `\n## 分阶段饮食方案\n\n`;
    c.phases.forEach(p => {
      content += `### ${p.name}\n\n**推荐食物：**\n`;
      p.foods.forEach(f => content += `- ${f}\n`);
      if (p.notes) content += `\n**注意事项：**\n${p.notes}\n`;
      if (p.avoid) {
        content += `\n**避免：**\n`;
        p.avoid.forEach(a => content += `- ${a}\n`);
      }
      content += '\n';
    });
  }

  if (c.nutritionAdvice) {
    content += `\n## 营养建议\n\n`;
    c.nutritionAdvice.forEach(n => {
      content += `### ${n.title}\n\n${n.detail}\n\n`;
    });
  }

  if (c.foodsRecommend) {
    content += `\n## 食物推荐与禁忌\n\n### 推荐食物\n\n`;
    c.foodsRecommend.good.forEach(f => {
      content += `| ${f.food} | ${f.reason} |\n`;
    });
    content += `\n### 避免食物\n\n`;
    c.foodsRecommend.avoid.forEach(f => {
      content += `| ${f.food} | ${f.reason} |\n`;
    });
    content += '\n';
  }

  if (c.protectiveFoods) {
    content += `\n## 保护性食物\n\n`;
    c.protectiveFoods.forEach(f => {
      content += `### ${f.food}\n\n**食物举例：**\n`;
      f.items.forEach(i => content += `- ${i}\n`);
      content += `\n**作用机制：**\n${f.effect}\n\n`;
    });
  }

  if (c.riskFoods) {
    content += `\n## 增加风险的食物\n\n`;
    c.riskFoods.forEach(f => {
      content += `### ${f.food}\n\n**食物举例：**\n`;
      f.items.forEach(i => content += `- ${i}\n`);
      content += `\n**风险：**\n${f.risk}\n\n`;
    });
  }

  if (c.supplements) {
    content += `\n## 营养补充剂\n\n`;
    c.supplements.forEach(s => {
      content += `| 营养素 | 剂量 | 依据 |\n|---------|------|------|\n`;
      content += `| ${s.name} | ${s.dose} | ${s.note} |\n\n`;
    });
  }

  if (c.evaluationCriteria) {
    content += `\n## 保胆手术评估标准\n\n`;
    c.evaluationCriteria.forEach(e => {
      content += `- **${e.criterion}：** ${e.standard}\n\n`;
    });
  }

  if (c.surgicalMethods) {
    content += `\n## 手术方式比较\n\n`;
    c.surgicalMethods.forEach(m => {
      content += `### ${m.name}\n\n`;
      content += `- **优点：** ${m.pros}\n`;
      content += `- **局限性：** ${m.cons}\n\n`;
    });
  }

  if (c.longTermOutcomes) {
    content += `\n## 长期疗效\n\n`;
    if (c.longTermOutcomes.study1) content += `**研究一：** ${c.longTermOutcomes.study1}\n\n`;
    if (c.longTermOutcomes.study2) content += `**研究二：** ${c.longTermOutcomes.study2}\n\n`;
    if (c.longTermOutcomes.study3) content += `**研究三：** ${c.longTermOutcomes.study3}\n\n`;
  }

  if (c.recurrenceFactors) {
    content += `\n## 复发相关因素\n\n`;
    c.recurrenceFactors.forEach((r, i) => {
      content += `${i + 1}. ${r}\n`;
    });
    content += '\n';
  }

  if (c.monitoringMethods) {
    content += `\n## 自我监测方法\n\n`;
    c.monitoringMethods.forEach(m => {
      content += `### ${m.name}\n\n`;
      content += `**正常表现：** ${m.normal}\n\n`;
      content += `**异常信号：** ${m.abnormal}\n\n`;
      content += `**处理建议：** ${m.urgency}\n\n`;
    });
  }

  if (c.warningSignals) {
    content += `\n## 预警信号与紧急就医指征\n\n`;
    c.warningSignals.forEach((w, i) => {
      content += `| 信号 | 描述 | 就医紧迫度 |\n|------|------|----------|\n`;
      content += `| ${w.signal} | ${w.description} | ${w.urgency} |\n\n`;
    });
  }

  if (c.labValues) {
    content += `\n## 实验室检查指标\n\n`;
    c.labValues.forEach(l => {
      content += `- **${l.item}**：正常值 ${l.normal}；意义：${l.significance}\n`;
    });
    content += '\n';
  }

  if (c.imaging) {
    content += `\n## 影像学检查建议\n\n`;
    if (c.imaging.ultrasound) content += `- **B超：** ${c.imaging.ultrasound}\n`;
    if (c.imaging.mrcp) content += `- **MRCP：** ${c.imaging.mrcp}\n`;
    if (c.imaging.ct) content += `- **CT：** ${c.imaging.ct}\n`;
    if (c.imaging.biopsy) content += `- **活检：** ${c.imaging.biopsy}\n`;
    content += '\n';
  }

  if (c.frequency) {
    content += `\n## 检查频率建议\n\n`;
    c.frequency.forEach(f => {
      content += `- **${f.group}：** ${f.check}\n`;
    });
    content += '\n';
  }

  if (c.successRate) {
    content += `\n## 临床疗效数据\n\n${c.successRate}\n\n`;
  }

  if (c.weightManagement) {
    content += `\n## 体重管理建议\n\n`;
    if (c.weightManagement.bmi) content += `- **BMI控制：** ${c.weightManagement.bmi}\n`;
    if (c.weightManagement.loss) content += `- **减重速度：** ${c.weightManagement.loss}\n`;
    if (c.weightManagement.exercise) content += `- **运动建议：** ${c.weightManagement.exercise}\n`;
    content += '\n';
  }

  if (c.dietaryPattern) {
    content += `\n## 饮食习惯建议\n\n`;
    if (c.dietaryPattern.breakfast) content += `- **早餐：** ${c.dietaryPattern.breakfast}\n`;
    if (c.dietaryPattern.meals) content += `- **规律进餐：** ${c.dietaryPattern.meals}\n`;
    if (c.dietaryPattern.water) content += `- **饮水：** ${c.dietaryPattern.water}\n`;
    if (c.dietaryPattern.timing) content += `- **进食时间：** ${c.dietaryPattern.timing}\n`;
    content += '\n';
  }

  if (c.researchData) {
    content += `\n## 循证医学数据\n\n${c.researchData}\n\n`;
  }

  if (c.caseStudy) {
    content += `## 临床案例\n\n`;
    const cs = c.caseStudy;
    content += `**患者信息：** ${cs.patient}\n\n`;
    if (cs.history) content += `**病史：** ${cs.history}\n\n`;
    if (cs.diagnosis) content += `**诊断：** ${cs.diagnosis}\n\n`;
    if (cs.treatment) content += `**治疗：** ${cs.treatment}\n\n`;
    if (cs.intervention) content += `**干预：** ${cs.intervention}\n\n`;
    if (cs.action) content += `**处置：** ${cs.action}\n\n`;
    if (cs.outcome) content += `**预后：** ${cs.outcome}\n\n`;
  }

  if (c.decision) {
    content += `## 手术选择建议\n\n${c.decision}\n\n`;
  }

  // 添加作者信息和免责声明
  content += `## 关于作者\n\n**刘波主任**，医学博士、教授、博士生导师，现任中山大学附属第三医院胆石症中心主任，岭南医院肝胆胰脾外科主任、普通外科主任。拥有超过三十年肝胆外科临床经验，专注于胆结石、肝癌、肝硬化与门静脉高压等疾病的微创治疗。\n\n`;

  content += `## 咨询方式\n\n如果您有相关问题，欢迎前往门诊咨询：\n\n`;
  content += `- **门诊时间**：每周一上午，周四下午\n`;
  content += `- **门诊地址**：广州市黄埔区开创大道2693号中山大学附属第三医院\n\n`;

  content += `---\n\n`;
  content += `> **免责声明：** 本文基于医学文献和临床经验撰写，仅供健康科普参考，不能替代专业医疗建议。如有相关症状，请及时就医，接受专业医生的诊断和治疗。\n`;

  return content;
}

// 主函数
function main() {
  console.log('========================================');
  console.log('  专业博客文章生成系统');
  console.log('========================================\n');

  // 获取命令行参数
  const args = process.argv.slice(2);
  let selectedTemplate;

  if (args.length > 0) {
    // 根据关键词选择模板
    const keyword = args[0].toLowerCase();
    selectedTemplate = ARTICLE_TEMPLATES.find(t =>
      t.id.includes(keyword) || t.topic.includes(args[0])
    );
  }

  // 如果没有指定或未找到，随机选择
  if (!selectedTemplate) {
    const index = Math.floor(Math.random() * ARTICLE_TEMPLATES.length);
    selectedTemplate = ARTICLE_TEMPLATES[index];
  }

  console.log(`选择的主题: ${selectedTemplate.topic}`);
  console.log(`分类: ${selectedTemplate.category}`);
  console.log(`日期: ${getTodayDate()}\n`);

  // 生成文章
  const articleId = generateArticleId(selectedTemplate);
  const articleContent = generateFullArticle(selectedTemplate);

  console.log(`生成文章ID: ${articleId}`);
  console.log(`生成文章内容... ✓\n`);

  // 保存草稿文件
  const draftsDir = path.join(__dirname, '../public/blog-posts/drafts');
  const draftFilePath = path.join(draftsDir, `${articleId}.md`);

  // 确保目录存在
  if (!fs.existsSync(draftsDir)) {
    fs.mkdirSync(draftsDir, { recursive: true });
  }

  // 保存 Markdown 文件
  fs.writeFileSync(draftFilePath, articleContent, 'utf8');
  console.log(`✓ 草稿已保存: ${draftFilePath}`);

  // 生成元数据配置
  const metadataConfig = `  {
    id: '${articleId}',
    title: '${selectedTemplate.topic}',
    titleEn: '${selectedTemplate.topic}',
    excerpt: '${selectedTemplate.content.intro.substring(0, 50)}...',
    excerptEn: '${selectedTemplate.content.intro.substring(0, 50)}...',
    date: '${getTodayDate()}',
    category: '${selectedTemplate.category}',
    categoryEn: '${getCategoryEn(selectedTemplate.category)}',
    imageUrl: '/images/pocs-surgery.jpg',
    author: '刘波主任'
  }`;

  console.log(`\n元数据配置（添加到 src/data/blog-posts.ts）:\n`);
  console.log(metadataConfig);

  // 生成使用说明
  console.log('\n========================================');
  console.log('  下一步操作:');
  console.log('========================================');
  console.log('1. 查看草稿文件: ' + draftFilePath);
  console.log('2. 检查文章内容是否完整准确');
  console.log('3. 根据需要调整或补充内容');
  console.log('4. 将文件从 drafts 目录移动到 blog-posts 目录');
  console.log('5. 在 src/data/blog-posts.ts 中添加元数据配置');
  console.log('6. 测试: npm run dev');
  console.log('7. 提交: git add && git commit && git push');
  console.log('========================================\n');
}

function getCategoryEn(cnCategory) {
  const map = {
    '胆结石预防': 'Gallstone Prevention',
    '技术介绍': 'Technology Introduction',
    '饮食指导': 'Dietary Guidance',
    '肝胆健康': 'Hepatobiliary Health'
  };
  return map[cnCategory] || 'General';
}

// 执行主函数
main();
