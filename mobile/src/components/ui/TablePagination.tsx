import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { PAGE_SIZE_OPTIONS } from '../../constants/pagination';
import { fonts, radius, spacing, type ColorPalette } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  noun?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/** Mirrors the web's TablePagination: row count, an editable rows-per-page selector, and prev/next. */
export default function TablePagination({ page, pageSize, total, noun = 'total', onPageChange, onPageSizeChange }: TablePaginationProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <View style={styles.root}>
      <Text style={styles.info} accessibilityLiveRegion="polite">
        Page {page} of {totalPages} · {total} {noun}
      </Text>

      <View style={styles.sizeRow}>
        <Text style={styles.info}>Rows per page</Text>
        {PAGE_SIZE_OPTIONS.map((size) => {
          const selected = size === pageSize;
          return (
            <Pressable
              key={size}
              onPress={() => onPageSizeChange(size)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${size} rows per page`}
              style={[styles.sizeChip, selected && styles.sizeChipSelected]}
            >
              <Text style={[styles.sizeText, selected && styles.sizeTextSelected]}>{size}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.buttons}>
        <Pressable
          onPress={() => onPageChange(page - 1)}
          disabled={page <= 1}
          accessibilityRole="button"
          accessibilityLabel="Previous page"
          style={[styles.button, page <= 1 && styles.disabled]}
        >
          <ChevronLeft size={14} color={colors.textSecondary} />
          <Text style={styles.buttonText}>Prev</Text>
        </Pressable>
        <Pressable
          onPress={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          accessibilityRole="button"
          accessibilityLabel="Next page"
          style={[styles.button, page >= totalPages && styles.disabled]}
        >
          <Text style={styles.buttonText}>Next</Text>
          <ChevronRight size={14} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    root: { marginTop: spacing.md, gap: spacing.sm + 4 },
    info: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular },
    sizeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    sizeChip: {
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    sizeChipSelected: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
    sizeText: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.semibold },
    sizeTextSelected: { color: colors.primaryLight },
    buttons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    disabled: { opacity: 0.4 },
    buttonText: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.semibold },
  });
}
